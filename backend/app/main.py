import os
import uuid
from datetime import datetime, timezone

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Query,
    UploadFile,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.orm import Session

from sqlalchemy import inspect, text

from . import models, schemas, security
from .database import Base, engine, get_db
from .security import get_current_user
from .websocket_manager import manager

Base.metadata.create_all(bind=engine)


def _migrate_add_missing_columns():
    """create_all() only adds missing tables, never columns to existing ones.
    Add any new nullable columns here so existing SQLite files upgrade in place
    instead of needing to be deleted and recreated."""
    inspector = inspect(engine)
    users_columns = {c["name"] for c in inspector.get_columns("users")}
    if "nickname" not in users_columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN nickname VARCHAR"))
    if "profile_image_url" not in users_columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_image_url VARCHAR"))

    stickers_columns = {c["name"] for c in inspector.get_columns("stickers")}
    if "image_url" not in stickers_columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE stickers ADD COLUMN image_url VARCHAR"))

    chat_rooms_columns = {c["name"] for c in inspector.get_columns("chat_rooms")}
    if "creator_id" not in chat_rooms_columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE chat_rooms ADD COLUMN creator_id INTEGER"))


_migrate_add_missing_columns()

# Superseded emoji-only catalog — replaced by the character image set below.
# Kept here only so the seeding step below knows which old rows to retire.
_RETIRED_STICKER_NAMES = ["smile", "laugh", "heart", "thumbsup", "clap", "cry", "surprise", "party"]

DEFAULT_STICKERS = [
    (f"sticker{i:02d}", "", f"/stickers/sticker_{i:02d}.png") for i in range(1, 37)
]


def _seed_stickers():
    db = next(get_db())
    try:
        db.query(models.Sticker).filter(models.Sticker.name.in_(_RETIRED_STICKER_NAMES)).delete(
            synchronize_session=False
        )
        existing_names = {s.name for s in db.query(models.Sticker).all()}
        for name, emoji, image_url in DEFAULT_STICKERS:
            if name not in existing_names:
                db.add(models.Sticker(name=name, emoji=emoji, image_url=image_url))
        db.commit()
    finally:
        db.close()


_seed_stickers()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_UPLOAD_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp",  # images
    ".pdf", ".txt", ".zip", ".docx", ".xlsx",  # files
}

app = FastAPI(title="말방구")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def _unread_count(db: Session, room_id: int, member: models.RoomMember) -> int:
    query = db.query(models.Message).filter(
        models.Message.room_id == room_id,
        models.Message.sender_id != member.user_id,
    )
    if member.last_read_message_id is not None:
        query = query.filter(models.Message.id > member.last_read_message_id)
    return query.count()


_MESSAGE_PREVIEW_LABELS = {
    "image": "사진을 보냈습니다",
    "file": "파일을 보냈습니다",
    "sticker": "이모티콘을 보냈습니다",
}


def _message_preview_text(msg: models.Message) -> str:
    if msg.message_type == "text":
        return msg.content or ""
    if msg.message_type == "money":
        return f"{(msg.amount or 0):,}원을 보냈습니다"
    if msg.message_type == "system":
        return msg.content or ""
    return _MESSAGE_PREVIEW_LABELS.get(msg.message_type, "")


def _room_to_out(db: Session, room: models.ChatRoom, current_user_id: int) -> schemas.RoomOut:
    unread = 0
    member = next((m for m in room.members if m.user_id == current_user_id), None)
    if member is not None:
        unread = _unread_count(db, room.id, member)

    creator = None
    if room.creator_id is not None:
        creator_member = next((m for m in room.members if m.user_id == room.creator_id), None)
        creator_user = creator_member.user if creator_member else db.get(models.User, room.creator_id)
        if creator_user is not None:
            creator = schemas.UserOut.model_validate(creator_user)

    last_msg = (
        db.query(models.Message)
        .filter(models.Message.room_id == room.id)
        .order_by(models.Message.id.desc())
        .first()
    )
    last_message_at = None
    if last_msg is not None:
        last_message_at = last_msg.created_at
        if last_message_at.tzinfo is None:
            # SQLite stores DateTime(timezone=True) values without an offset,
            # but func.now() writes UTC — tag it explicitly so the JSON
            # serialization includes a UTC marker the browser can parse correctly.
            last_message_at = last_message_at.replace(tzinfo=timezone.utc)

    return schemas.RoomOut(
        id=room.id,
        name=room.name,
        is_group=room.is_group,
        members=[schemas.UserOut.model_validate(m.user) for m in room.members],
        creator=creator,
        unread_count=unread,
        last_message=_message_preview_text(last_msg) if last_msg else None,
        last_message_at=last_message_at,
    )


def _require_membership(db: Session, room_id: int, user_id: int) -> models.RoomMember:
    member = (
        db.query(models.RoomMember).filter_by(room_id=room_id, user_id=user_id).first()
    )
    if member is None:
        raise HTTPException(403, "not a member of this room")
    return member


@app.get("/auth/check-username", response_model=schemas.UsernameAvailability)
def check_username(username: str, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter_by(username=username).first()
    return schemas.UsernameAvailability(available=existing is None)


@app.post("/auth/signup", response_model=schemas.Token)
def signup(payload: schemas.UserSignup, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter_by(username=payload.username).first()
    if existing:
        raise HTTPException(400, "username already taken")
    if not payload.security_question.strip() or not payload.security_answer.strip():
        raise HTTPException(400, "security question and answer are required")
    db_user = models.User(
        username=payload.username,
        hashed_password=security.hash_password(payload.password),
        security_question=payload.security_question.strip(),
        security_answer_hash=security.hash_security_answer(payload.security_answer),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = security.create_access_token(db_user.id, db_user.username)
    return schemas.Token(access_token=token, user=db_user)


@app.get("/auth/security-question", response_model=schemas.SecurityQuestionOut)
def get_security_question(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=username).first()
    if user is None:
        raise HTTPException(404, "user not found")
    return schemas.SecurityQuestionOut(security_question=user.security_question)


@app.post("/auth/reset-password", status_code=204)
def reset_password(payload: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=payload.username).first()
    if user is None or not security.verify_security_answer(
        payload.security_answer, user.security_answer_hash
    ):
        raise HTTPException(400, "username or security answer is incorrect")
    user.hashed_password = security.hash_password(payload.new_password)
    db.commit()


@app.post("/auth/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=payload.username).first()
    if user is None or not security.verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "invalid username or password")
    token = security.create_access_token(user.id, user.username)
    return schemas.Token(access_token=token, user=user)


@app.get("/users/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.patch("/users/me", response_model=schemas.UserOut)
def update_me(
    payload: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    fields = payload.model_dump(exclude_unset=True)
    if "nickname" in fields:
        nickname = (fields["nickname"] or "").strip()
        if not nickname:
            raise HTTPException(400, "nickname must not be empty")
        if len(nickname) > 20:
            raise HTTPException(400, "nickname must be 20 characters or fewer")
        current_user.nickname = nickname
    if "profile_image_url" in fields:
        current_user.profile_image_url = fields["profile_image_url"]
    db.commit()
    db.refresh(current_user)
    return current_user


@app.get("/users", response_model=list[schemas.UserListItem])
def list_users(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    users = db.query(models.User).filter(models.User.id != current_user.id).all()
    return [
        schemas.UserListItem(
            id=u.id,
            username=u.username,
            nickname=u.nickname,
            profile_image_url=u.profile_image_url,
            is_online=manager.is_online(u.id),
        )
        for u in users
    ]


@app.post("/rooms", response_model=schemas.RoomOut)
def create_room(
    room: schemas.RoomCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    member_ids = set(room.user_ids) | {current_user.id}
    if len(member_ids) < 2:
        raise HTTPException(400, "a room needs at least 2 members")

    users = db.query(models.User).filter(models.User.id.in_(member_ids)).all()
    if len(users) != len(member_ids):
        raise HTTPException(404, "one or more users not found")

    db_room = models.ChatRoom(name=room.name, is_group=len(member_ids) > 2, creator_id=current_user.id)
    db.add(db_room)
    db.flush()
    for user_id in member_ids:
        db.add(models.RoomMember(room_id=db_room.id, user_id=user_id))
    db.commit()
    db.refresh(db_room)
    return _room_to_out(db, db_room, current_user.id)


@app.get("/rooms", response_model=list[schemas.RoomOut])
def list_my_rooms(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    rooms = (
        db.query(models.ChatRoom)
        .join(models.RoomMember)
        .filter(models.RoomMember.user_id == current_user.id)
        .all()
    )
    return [_room_to_out(db, r, current_user.id) for r in rooms]


@app.post("/rooms/{room_id}/members", response_model=schemas.RoomOut)
async def add_room_members(
    room_id: int,
    payload: schemas.RoomMembersAdd,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    room = db.get(models.ChatRoom, room_id)
    if room is None:
        raise HTTPException(404, "room not found")
    _require_membership(db, room_id, current_user.id)

    existing_member_ids = {m.user_id for m in room.members}
    new_ids = set(payload.user_ids) - existing_member_ids
    if new_ids:
        users = db.query(models.User).filter(models.User.id.in_(new_ids)).all()
        if len(users) != len(new_ids):
            raise HTTPException(404, "one or more users not found")
        for user_id in new_ids:
            db.add(models.RoomMember(room_id=room_id, user_id=user_id))
        room.is_group = True
        db.commit()
        db.refresh(room)

        invited_names = ", ".join(u.username for u in users)
        system_msg = models.Message(
            room_id=room_id,
            sender_id=current_user.id,
            message_type="system",
            content=f"{invited_names}님을 초대했습니다",
        )
        db.add(system_msg)
        db.commit()
        db.refresh(system_msg)
        await manager.broadcast(room_id, _message_broadcast_payload(system_msg))
    return _room_to_out(db, room, current_user.id)


@app.delete("/rooms/{room_id}/members/me", status_code=204)
async def leave_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    member = _require_membership(db, room_id, current_user.id)
    db.delete(member)
    db.commit()

    remaining = db.query(models.RoomMember).filter_by(room_id=room_id).count()
    if remaining == 0:
        db.query(models.Message).filter_by(room_id=room_id).delete()
        room = db.get(models.ChatRoom, room_id)
        if room is not None:
            db.delete(room)
        db.commit()
        return

    system_msg = models.Message(
        room_id=room_id,
        sender_id=current_user.id,
        message_type="system",
        content=f"{current_user.username}님이 나갔습니다",
    )
    db.add(system_msg)
    db.commit()
    db.refresh(system_msg)
    await manager.broadcast(room_id, _message_broadcast_payload(system_msg))


@app.get("/rooms/{room_id}/messages", response_model=list[schemas.MessageOut])
def get_messages(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _require_membership(db, room_id, current_user.id)
    return (
        db.query(models.Message)
        .filter_by(room_id=room_id)
        .order_by(models.Message.created_at)
        .all()
    )


@app.post("/rooms/{room_id}/read", status_code=204)
def mark_room_read(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    member = _require_membership(db, room_id, current_user.id)
    latest = (
        db.query(models.Message)
        .filter_by(room_id=room_id)
        .order_by(models.Message.id.desc())
        .first()
    )
    if latest:
        member.last_read_message_id = latest.id
        db.commit()


@app.get("/stickers", response_model=list[schemas.StickerOut])
def list_stickers(db: Session = Depends(get_db)):
    return db.query(models.Sticker).all()


@app.get("/wallet/me", response_model=schemas.WalletOut)
def get_my_wallet(current_user: models.User = Depends(get_current_user)):
    return schemas.WalletOut(balance=current_user.balance)


@app.post("/upload", response_model=schemas.UploadOut)
async def upload_file(
    file: UploadFile, current_user: models.User = Depends(get_current_user)
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(400, f"unsupported file extension: {ext}")

    contents = await file.read(MAX_UPLOAD_SIZE + 1)
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(400, "file too large (max 10MB)")

    stored_name = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(UPLOAD_DIR, stored_name), "wb") as f:
        f.write(contents)

    return schemas.UploadOut(file_url=f"/uploads/{stored_name}", file_name=file.filename)


def _iso_utc(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def _message_broadcast_payload(msg: models.Message) -> dict:
    sticker = msg.sticker
    return {
        "type": "message",
        "id": msg.id,
        "room_id": msg.room_id,
        "sender_id": msg.sender_id,
        "message_type": msg.message_type,
        "content": msg.content,
        "file_url": msg.file_url,
        "file_name": msg.file_name,
        "sticker": (
            {"id": sticker.id, "name": sticker.name, "emoji": sticker.emoji, "image_url": sticker.image_url}
            if sticker
            else None
        ),
        "amount": msg.amount,
        "recipient_id": msg.recipient_id,
        "created_at": _iso_utc(msg.created_at),
        "read_at": _iso_utc(msg.read_at),
    }


def _authenticate_ws_token(token: str) -> int | None:
    try:
        payload = security.decode_access_token(token)
        return int(payload["sub"])
    except Exception:
        return None


@app.websocket("/ws/presence")
async def presence_websocket(websocket: WebSocket, token: str = Query(...)):
    user_id = _authenticate_ws_token(token)
    if user_id is None:
        await websocket.close(code=4401)
        return

    await manager.connect_presence(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect_presence(user_id)


@app.websocket("/ws/{room_id}")
async def chat_websocket(websocket: WebSocket, room_id: int, token: str = Query(...)):
    user_id = _authenticate_ws_token(token)
    if user_id is None:
        await websocket.close(code=4401)
        return

    db = next(get_db())
    room = db.get(models.ChatRoom, room_id)
    member = (
        db.query(models.RoomMember)
        .filter_by(room_id=room_id, user_id=user_id)
        .first()
    )
    if room is None or member is None:
        await websocket.close(code=4404)
        return

    await manager.connect_room(room_id, user_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")

            if event_type == "message":
                message_type = data.get("message_type", "text")
                if message_type not in ("text", "image", "file", "sticker", "money"):
                    continue

                sticker = None
                amount = None
                recipient_id = None

                if message_type == "text":
                    if not data.get("content"):
                        continue
                elif message_type in ("image", "file"):
                    if not data.get("file_url"):
                        continue
                elif message_type == "sticker":
                    sticker = db.get(models.Sticker, data.get("sticker_id"))
                    if sticker is None:
                        continue
                elif message_type == "money":
                    amount = data.get("amount")
                    recipient_id = data.get("recipient_id")
                    if not isinstance(amount, (int, float)) or amount <= 0 or recipient_id is None:
                        continue
                    amount = int(amount)
                    if recipient_id == user_id:
                        await websocket.send_json(
                            {"type": "error", "message": "cannot send money to yourself"}
                        )
                        continue
                    recipient_member = (
                        db.query(models.RoomMember)
                        .filter_by(room_id=room_id, user_id=recipient_id)
                        .first()
                    )
                    if recipient_member is None:
                        await websocket.send_json(
                            {"type": "error", "message": "recipient is not a member of this room"}
                        )
                        continue
                    sender = db.get(models.User, user_id)
                    if sender.balance < amount:
                        await websocket.send_json(
                            {"type": "error", "message": "insufficient balance"}
                        )
                        continue
                    recipient_user = db.get(models.User, recipient_id)
                    sender.balance -= amount
                    recipient_user.balance += amount

                msg = models.Message(
                    room_id=room_id,
                    sender_id=user_id,
                    message_type=message_type,
                    content=data.get("content"),
                    file_url=data.get("file_url"),
                    file_name=data.get("file_name"),
                    sticker_id=sticker.id if sticker else None,
                    amount=amount,
                    recipient_id=recipient_id,
                )
                db.add(msg)
                db.commit()
                db.refresh(msg)
                await manager.broadcast(room_id, _message_broadcast_payload(msg))
            elif event_type == "read":
                message_id = data.get("message_id")
                msg = db.get(models.Message, message_id)
                if msg and msg.room_id == room_id and msg.read_at is None:
                    msg.read_at = datetime.now(timezone.utc)
                    db.commit()
                    await manager.broadcast(
                        room_id,
                        {
                            "type": "read",
                            "message_id": msg.id,
                            "read_at": msg.read_at.isoformat(),
                        },
                        exclude_user_id=user_id,
                    )
    except WebSocketDisconnect:
        manager.disconnect_room(room_id, user_id)
    finally:
        db.close()


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        try:
            return await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            if exc.status_code == 404:
                return await super().get_response("index.html", scope)
            raise


FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
if os.path.isdir(FRONTEND_DIST):
    app.mount("/", SPAStaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
