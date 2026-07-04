from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # room_id -> {user_id: WebSocket}
        self.rooms: dict[int, dict[int, WebSocket]] = {}
        # user_id -> number of live connections (room chats + presence socket)
        self.online_counts: dict[int, int] = {}

    async def connect_room(self, room_id: int, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.rooms.setdefault(room_id, {})[user_id] = websocket
        self._mark_online(user_id)

    def disconnect_room(self, room_id: int, user_id: int):
        room = self.rooms.get(room_id)
        if room and user_id in room:
            del room[user_id]
            if not room:
                del self.rooms[room_id]
        self._mark_offline(user_id)

    async def connect_presence(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self._mark_online(user_id)

    def disconnect_presence(self, user_id: int):
        self._mark_offline(user_id)

    def _mark_online(self, user_id: int):
        self.online_counts[user_id] = self.online_counts.get(user_id, 0) + 1

    def _mark_offline(self, user_id: int):
        if user_id in self.online_counts:
            self.online_counts[user_id] -= 1
            if self.online_counts[user_id] <= 0:
                del self.online_counts[user_id]

    def is_online(self, user_id: int) -> bool:
        return self.online_counts.get(user_id, 0) > 0

    async def broadcast(self, room_id: int, message: dict, exclude_user_id: int | None = None):
        room = self.rooms.get(room_id, {})
        for user_id, ws in list(room.items()):
            if user_id == exclude_user_id:
                continue
            await ws.send_json(message)


manager = ConnectionManager()
