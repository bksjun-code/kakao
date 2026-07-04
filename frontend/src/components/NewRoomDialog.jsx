import { useEffect, useState } from "react";
import { api } from "../api";
import { Icon } from "./Icon";
import { Button } from "./Button";
import { displayName } from "../displayName";

export default function NewRoomDialog({ open, token, onCreate, onCancel }) {
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    api.listUsers(token).then(setUsers).catch((err) => setError(err.detail || err.message));
  }, [open, token]);

  if (!open) return null;

  const toggle = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const close = () => {
    setName("");
    setSearch("");
    setSelectedIds([]);
    setError(null);
    onCancel();
  };

  const submit = async () => {
    if (selectedIds.length === 0) {
      setError("초대할 사람을 한 명 이상 선택해주세요.");
      return;
    }
    setError(null);
    try {
      await onCreate(name || null, selectedIds);
      setName("");
      setSearch("");
      setSelectedIds([]);
    } catch (err) {
      setError(err.detail || err.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.trim().toLowerCase()) ||
      (u.nickname || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="sheet-overlay" onClick={close}>
      <div className="sheet-card" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber-row">
          <span className="sheet-grabber" />
        </div>
        <div className="sheet-header">채팅방 만들기</div>

        <div className="sheet-body">
          <input
            placeholder="방 이름 (선택, 그룹일 때)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="아이디로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <p className="field-label-plain">
            초대할 사람 선택{selectedIds.length > 0 ? ` (${selectedIds.length}명)` : ""}
          </p>
          <div className="invite-list">
            {filteredUsers.map((u, i) => {
              const checked = selectedIds.includes(u.id);
              return (
                <div
                  key={u.id}
                  className={`list-row${i === filteredUsers.length - 1 ? " list-row-last" : ""}`}
                  onClick={() => toggle(u.id)}
                >
                  <span className={`presence-dot ${u.is_online ? "online" : "offline"}`} />
                  <span className="list-row-title">{displayName(u)}</span>
                  {checked && <Icon name="checkmark.circle.fill" size={20} color="var(--tint)" />}
                </div>
              );
            })}
            {filteredUsers.length === 0 && <div className="empty-state">일치하는 사용자가 없어요</div>}
          </div>

          {error && <div className="error-text">{error}</div>}
        </div>

        <div className="sheet-footer">
          <Button variant="gray" onClick={close}>취소</Button>
          <Button onClick={submit} disabled={selectedIds.length === 0}>
            {selectedIds.length > 1 ? "그룹 채팅 만들기" : "채팅 만들기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
