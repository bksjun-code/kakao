import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, resolveImageUrl } from "../api";
import NewRoomDialog from "../components/NewRoomDialog";
import SettingsSheet from "../components/SettingsSheet";
import { Icon } from "../components/Icon";
import { displayName } from "../displayName";

export default function HomePage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState(null);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const refresh = async () => {
    const [roomsData, walletData] = await Promise.all([
      api.listRooms(token),
      api.getWallet(token),
    ]);
    setRooms(roomsData);
    setWallet(walletData);
  };

  useEffect(() => {
    refresh().catch((err) => setError(err.detail || err.message));
    const interval = setInterval(() => refresh().catch(() => {}), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateRoom = async (name, userIds) => {
    const room = await api.createRoom(token, userIds, name);
    setShowNewRoom(false);
    await refresh();
    navigate(`/rooms/${room.id}`);
  };

  const roomLabel = (room) => {
    if (room.name) return room.name;
    const others = room.members.filter((m) => m.id !== user.id);
    return others.map((m) => displayName(m)).join(", ") || "나";
  };

  const formatLastMessageTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const isSameDay = date.toDateString() === now.toDateString();
    if (isSameDay) {
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const period = hours < 12 ? "오전" : "오후";
      hours = hours % 12 || 12;
      return `${period} ${String(hours).padStart(2, "0")}:${minutes}`;
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "어제";
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <div className="home-screen">
      <div className="nav-bar home-nav-bar">
        <div className="nav-bar-row" style={{ justifyContent: "flex-end" }}>
          <button className="icon-button" onClick={logout} aria-label="로그아웃">
            <img src="/logout.png" alt="" className="logout-icon" />
          </button>
        </div>
        <button className="settings-circle-button" onClick={() => setShowSettings(true)} aria-label="설정">
          <img src="/setting.png" alt="" className="settings-icon" />
        </button>
        <div className="account-card-row">
          <div className="account-card">
            <div className="account-row">
              <Icon name="person.crop.circle" size={15} />
              <span>{displayName(user)}님</span>
            </div>
            <div className="account-row">
              <Icon name="wallet.pass" size={15} />
              <span className="balance-value">{wallet?.balance?.toLocaleString() ?? "-"}원</span>
            </div>
          </div>
        </div>
        <div className="nav-bar-large-title">
          <h1 className="home-brand sr-only">말방구</h1>
        </div>
      </div>

      {error && <div className="error-text" style={{ padding: "0 16px" }}>{error}</div>}

      <div className="grouped-section">
        <div className="grouped-header-row">
          <span className="grouped-header">채팅방</span>
          <button className="icon-button" onClick={() => setShowNewRoom(true)} aria-label="채팅방 만들기">
            <Icon name="plus" size={20} weight="semibold" />
          </button>
        </div>
        <div className="grouped-card">
          {rooms.map((room, i) => (
            <div
              key={room.id}
              className={`list-row${i === rooms.length - 1 ? " list-row-last" : ""}`}
              onClick={() => navigate(`/rooms/${room.id}`)}
            >
              <div className="list-row-avatar">
                {room.creator?.profile_image_url ? (
                  <img src={resolveImageUrl(room.creator.profile_image_url)} alt="" />
                ) : (
                  <Icon name="person.crop.circle" size={22} color="var(--text-tertiary)" />
                )}
              </div>
              <div className="list-row-content">
                <div className="list-row-top">
                  <span className="list-row-title">
                    {roomLabel(room)}
                    {room.is_group && (
                      <span className="list-row-member-count">({room.members.length}명)</span>
                    )}
                  </span>
                  {room.is_group && <span className="badge-group">그룹</span>}
                  <span className="list-row-time">{formatLastMessageTime(room.last_message_at)}</span>
                </div>
                <div className="list-row-bottom">
                  <span className="list-row-preview">{room.last_message || "대화를 시작해보세요"}</span>
                  {room.unread_count > 0 && <span className="badge-unread">{room.unread_count}</span>}
                </div>
              </div>
              <Icon name="chevron.right.small" size={18} color="var(--text-tertiary)" />
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="empty-state">채팅방이 없어요. + 버튼으로 시작해보세요.</div>
          )}
        </div>
      </div>

      <NewRoomDialog
        open={showNewRoom}
        token={token}
        currentUserId={user.id}
        onCreate={handleCreateRoom}
        onCancel={() => setShowNewRoom(false)}
      />

      <SettingsSheet open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
