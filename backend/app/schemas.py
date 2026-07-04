from datetime import datetime, timezone
from pydantic import BaseModel, field_validator


class UserOut(BaseModel):
    id: int
    username: str
    nickname: str | None = None
    profile_image_url: str | None = None

    class Config:
        from_attributes = True


class UserListItem(UserOut):
    is_online: bool


class ProfileUpdate(BaseModel):
    nickname: str | None = None
    profile_image_url: str | None = None


class UserSignup(BaseModel):
    username: str
    password: str
    security_question: str
    security_answer: str


class UserLogin(BaseModel):
    username: str
    password: str


class UsernameAvailability(BaseModel):
    available: bool


class SecurityQuestionOut(BaseModel):
    security_question: str


class PasswordResetRequest(BaseModel):
    username: str
    security_answer: str
    new_password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RoomCreate(BaseModel):
    user_ids: list[int]
    name: str | None = None


class RoomOut(BaseModel):
    id: int
    name: str | None
    is_group: bool
    members: list[UserOut]
    creator: UserOut | None = None
    unread_count: int = 0
    last_message: str | None = None
    last_message_at: datetime | None = None

    class Config:
        from_attributes = True


class RoomMembersAdd(BaseModel):
    user_ids: list[int]


class StickerOut(BaseModel):
    id: int
    name: str
    emoji: str
    image_url: str | None = None

    class Config:
        from_attributes = True


class MessageOut(BaseModel):
    id: int
    room_id: int
    sender_id: int
    message_type: str
    content: str | None
    file_url: str | None
    file_name: str | None
    sticker: StickerOut | None
    amount: int | None
    recipient_id: int | None
    created_at: datetime
    read_at: datetime | None

    @field_validator("created_at", "read_at")
    @classmethod
    def _ensure_utc(cls, v):
        # SQLite returns naive datetimes for DateTime(timezone=True) columns even
        # though the stored value is UTC (see main.py's _room_to_out for the same
        # fix) — tag it explicitly so JSON serialization includes a UTC marker.
        if v is not None and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

    class Config:
        from_attributes = True


class UploadOut(BaseModel):
    file_url: str
    file_name: str


class WalletOut(BaseModel):
    balance: int
