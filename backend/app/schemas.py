from datetime import datetime
from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    username: str
    nickname: str | None = None

    class Config:
        from_attributes = True


class UserListItem(UserOut):
    is_online: bool


class NicknameUpdate(BaseModel):
    nickname: str


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
    unread_count: int = 0

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

    class Config:
        from_attributes = True


class UploadOut(BaseModel):
    file_url: str
    file_name: str


class WalletOut(BaseModel):
    balance: int
