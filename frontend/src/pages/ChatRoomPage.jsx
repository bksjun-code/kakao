import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, wsUrl, API_BASE, resolveImageUrl } from "../api";
import ConfirmDialog from "../components/ConfirmDialog";
import InviteMemberDialog from "../components/InviteMemberDialog";
import { Icon } from "../components/Icon";
import { Button } from "../components/Button";
import { useAppearance, BUBBLE_SHAPES } from "../context/AppearanceContext";
import { displayName } from "../displayName";

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { chatBackground, bubble } = useAppearance();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [content, setContent] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [showMoney, setShowMoney] = useState(false);
  const [moneyRecipient, setMoneyRecipient] = useState("");
  const [moneyAmount, setMoneyAmount] = useState("");
  const [error, setError] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [moneyError, setMoneyError] = useState(null);

  const wsRef = useRef(null);
  const fileInputRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const [rooms, history, stickerList, walletData] = await Promise.all([
        api.listRooms(token),
        api.getMessages(token, roomId),
        api.listStickers(),
        api.getWallet(token),
      ]);
      if (cancelled) return;
      setRoom(rooms.find((r) => String(r.id) === String(roomId)) ?? null);
      setMessages(history);
      setStickers(stickerList);
      setWallet(walletData);
      await api.markRoomRead(token, roomId);
    }
    setup().catch((err) => setError(err.detail || err.message));

    const ws = new WebSocket(wsUrl(`/ws/${roomId}`, token));
    wsRef.current = ws;
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "error") {
        if (data.message === "insufficient balance") {
          setMoneyError("insufficient_balance");
        } else {
          setError(translateWsError(data.message));
        }
      } else if (data.type === "message") {
        setMessages((prev) => [...prev, data]);
        if (data.sender_id !== user.id) {
          api.markRoomRead(token, roomId).catch(() => {});
          ws.send(JSON.stringify({ type: "read", message_id: data.id }));
        }
        if (data.message_type === "money" && (data.sender_id === user.id || data.recipient_id === user.id)) {
          api.getWallet(token).then(setWallet).catch(() => {});
        }
      } else if (data.type === "read") {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.message_id ? { ...m, read_at: data.read_at } : m))
        );
      }
    };
    ws.onclose = (e) => {
      if (e.code === 4401) setError("인증이 만료되었습니다. 다시 로그인해주세요.");
      else if (e.code === 4404) setError("방을 찾을 수 없거나 멤버가 아닙니다.");
    };

    return () => {
      cancelled = true;
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, token]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendJson = (payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    sendJson({ type: "message", message_type: "text", content });
    setContent("");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploaded = await api.upload(token, file);
      const isImage = /\.(png|jpe?g|gif|webp)$/i.test(uploaded.file_name);
      sendJson({
        type: "message",
        message_type: isImage ? "image" : "file",
        file_url: uploaded.file_url,
        file_name: uploaded.file_name,
      });
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      e.target.value = "";
    }
  };

  const handleSendSticker = (sticker) => {
    sendJson({ type: "message", message_type: "sticker", sticker_id: sticker.id });
    setShowStickers(false);
  };

  const handleSendMoney = (e) => {
    e.preventDefault();
    const amount = parseInt(moneyAmount, 10);
    if (!moneyRecipient || !amount || amount <= 0) return;
    if (wallet && amount > wallet.balance) {
      setMoneyError("insufficient_balance");
      return;
    }
    sendJson({ type: "message", message_type: "money", recipient_id: parseInt(moneyRecipient, 10), amount });
    setMoneyAmount("");
    setShowMoney(false);
  };

  const roomLabel = () => {
    if (!room) return "";
    if (room.name) return room.name;
    const others = room.members.filter((m) => m.id !== user.id);
    return others.map((m) => displayName(m)).join(", ") || "나";
  };

  const memberOf = (userId) => room?.members.find((m) => m.id === userId);
  const usernameOf = (userId) => {
    const member = memberOf(userId);
    return member ? displayName(member) : userId;
  };

  const handleLeaveRoom = async () => {
    setShowLeaveConfirm(false);
    setError(null);
    try {
      await api.leaveRoom(token, roomId);
      navigate("/");
    } catch (err) {
      setError(err.detail || err.message);
    }
  };

  const handleInvite = async (userIds) => {
    const updatedRoom = await api.addRoomMembers(token, roomId, userIds);
    setRoom(updatedRoom);
    setShowInvite(false);
  };

  return (
    <div className="chat-screen">
      <div className="nav-bar chat-header">
        <div className="nav-bar-row">
          <button className="nav-back" onClick={() => navigate("/")}>
            <Icon name="chevron.left" size={22} weight="semibold" />
            목록
          </button>
          <span className="nav-bar-title">{roomLabel()}</span>
          <div className="chat-header-actions">
            <button className="invite-button" onClick={() => setShowInvite(true)}>초대</button>
            <button className="leave-button" onClick={() => setShowLeaveConfirm(true)}>방 나가기</button>
          </div>
        </div>
      </div>

      <InviteMemberDialog
        open={showInvite}
        token={token}
        existingMemberIds={room?.members.map((m) => m.id) ?? []}
        onInvite={handleInvite}
        onCancel={() => setShowInvite(false)}
      />

      <ConfirmDialog
        open={showLeaveConfirm}
        message={"이 채팅방에서 나가시겠습니까?"}
        confirmText="나가기"
        destructive
        onConfirm={handleLeaveRoom}
        onCancel={() => setShowLeaveConfirm(false)}
      />

      <ConfirmDialog
        open={!!moneyError}
        title="송금할 수 없어요"
        message={`송금 가능한 금액을 초과했어요.\n최대 송금\n가능 금액: ${wallet?.balance?.toLocaleString() ?? 0}원`}
        confirmText="확인"
        onConfirm={() => setMoneyError(null)}
      />

      {error && <div className="error-text">{error}</div>}

      <div className="message-log" style={messageLogStyle(chatBackground)}>
        {groupMessages(messages, user.id).map((item) => {
          if (item.type === "date-divider") {
            return (
              <div key={`date-${item.date}`} className="date-divider">
                <span>{formatDateDivider(item.date)}</span>
              </div>
            );
          }
          if (item.type === "system") {
            return (
              <div key={item.message.id} className="system-message">
                {item.message.content}
              </div>
            );
          }
          return (
            <MessageGroup
              key={item.messages[0].id}
              messages={item.messages}
              isMine={item.isMine}
              usernameOf={usernameOf}
              memberOf={memberOf}
              bubble={bubble}
            />
          );
        })}
        <div ref={logEndRef} />
      </div>

      <div className="composer">
        {showStickers && (
          <div className="sticker-picker">
            {stickers.map((s) => (
              <button key={s.id} onClick={() => handleSendSticker(s)} title={s.name}>
                {s.image_url ? <img src={s.image_url} alt={s.name} className="sticker-picker-image" /> : s.emoji}
              </button>
            ))}
          </div>
        )}
        {showMoney && (
          <div>
            <form className="money-form" noValidate onSubmit={handleSendMoney}>
              <select value={moneyRecipient} onChange={(e) => setMoneyRecipient(e.target.value)}>
                <option value="">받는 사람</option>
                {room?.members
                  .filter((m) => m.id !== user.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>{displayName(m)}</option>
                  ))}
              </select>
              <input
                placeholder="금액"
                type="number"
                max={wallet?.balance}
                value={moneyAmount}
                onChange={(e) => setMoneyAmount(e.target.value)}
              />
              <Button type="submit" size="small">보내기</Button>
            </form>
            <p className="subtle money-balance-hint">
              보유 잔액: {wallet?.balance?.toLocaleString() ?? "-"}원
            </p>
          </div>
        )}
        <form className="composer-row" onSubmit={handleSendText}>
          <button type="button" className="icon-button emoji" onClick={() => fileInputRef.current?.click()}>📎</button>
          <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} />
          <button type="button" className="icon-button emoji" onClick={() => setShowStickers((v) => !v)}>😀</button>
          <button type="button" className="icon-button emoji" onClick={() => setShowMoney((v) => !v)}>💸</button>
          <input
            className="composer-input"
            placeholder="메시지 입력"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button type="submit" size="small">전송</Button>
        </form>
      </div>
    </div>
  );
}

const WS_ERROR_MESSAGES = {
  "cannot send money to yourself": "본인에게는 송금할 수 없어요.",
  "recipient is not a member of this room": "받는 사람이 이 채팅방의 멤버가 아니에요.",
};

function translateWsError(message) {
  return WS_ERROR_MESSAGES[message] || message;
}

function messageLogStyle(chatBackground) {
  if (chatBackground.type === "image" && chatBackground.value) {
    return {
      backgroundImage: `url(${API_BASE}${chatBackground.value})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (chatBackground.type === "color" && chatBackground.value) {
    return { background: chatBackground.value };
  }
  return undefined;
}

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function linkify(text) {
  // split() with a capturing group places matched URLs at odd indices
  return text.split(URL_PATTERN).map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="message-link">
        {part}
      </a>
    ) : (
      part
    )
  );
}

const GROUP_GAP_MS = 5 * 60 * 1000;
const KOREAN_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// Splits a flat message list into date-divider / system / grouped-message items:
// consecutive messages from the same sender (within GROUP_GAP_MS of each other)
// share one avatar+name header, matching the reference chat layout.
function groupMessages(messages, myUserId) {
  const items = [];
  let lastDateKey = null;
  let currentGroup = null;

  for (const m of messages) {
    const date = new Date(m.created_at);
    const dateKey = date.toDateString();
    if (dateKey !== lastDateKey) {
      items.push({ type: "date-divider", date: m.created_at });
      lastDateKey = dateKey;
      currentGroup = null;
    }

    if (m.message_type === "system") {
      items.push({ type: "system", message: m });
      currentGroup = null;
      continue;
    }

    const isMine = m.sender_id === myUserId;
    const lastInGroup = currentGroup?.messages[currentGroup.messages.length - 1];
    const canJoin =
      currentGroup &&
      currentGroup.isMine === isMine &&
      currentGroup.senderId === m.sender_id &&
      date - new Date(lastInGroup.created_at) < GROUP_GAP_MS;

    if (canJoin) {
      currentGroup.messages.push(m);
    } else {
      currentGroup = { type: "group", isMine, senderId: m.sender_id, messages: [m] };
      items.push(currentGroup);
    }
  }
  return items;
}

function formatDateDivider(isoString) {
  const date = new Date(isoString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${KOREAN_WEEKDAYS[date.getDay()]}요일`;
}

function formatBubbleTime(isoString) {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours < 12 ? "오전" : "오후";
  hours = hours % 12 || 12;
  return `${period} ${hours}:${minutes}`;
}

function MessageGroup({ messages, isMine, usernameOf, memberOf, bubble }) {
  const sender = !isMine ? memberOf(messages[0].sender_id) : null;
  const lastIndex = messages.length - 1;

  return (
    <div className={`message-group ${isMine ? "mine" : "theirs"}`}>
      {!isMine && (
        <div className="group-avatar">
          {sender?.profile_image_url ? (
            <img src={resolveImageUrl(sender.profile_image_url)} alt="" />
          ) : (
            <Icon name="person.crop.circle" size={22} color="var(--text-tertiary)" />
          )}
        </div>
      )}
      <div className="group-content">
        {!isMine && <div className="group-sender-name">{usernameOf(messages[0].sender_id)}</div>}
        {messages.map((message, idx) => {
          const meta = idx === lastIndex && (
            <div className="bubble-meta">
              {isMine && message.read_at && <div className="read-marker">읽음</div>}
              <span className="bubble-time">{formatBubbleTime(message.created_at)}</span>
            </div>
          );
          return (
            <div className="bubble-row" key={message.id}>
              {isMine && meta}
              <MessageBubble message={message} isMine={isMine} usernameOf={usernameOf} bubble={bubble} />
              {!isMine && meta}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MessageBubble({ message, isMine, usernameOf, bubble }) {
  const shape = BUBBLE_SHAPES[bubble.shape] || BUBBLE_SHAPES.rounded;
  const bubbleStyle = {
    fontSize: bubble.fontSize,
    borderRadius: shape.radius,
    ...(isMine
      ? {
          borderBottomRightRadius: shape.tailRadius,
          ...(bubble.myBubbleColor ? { background: bubble.myBubbleColor } : {}),
        }
      : { borderBottomLeftRadius: shape.tailRadius }),
    ...(bubble.textColor ? { color: bubble.textColor } : {}),
  };

  return (
    <div
      className={`message-bubble${message.message_type === "image" ? " message-bubble-image" : ""}${message.message_type === "sticker" && message.sticker?.image_url ? " message-bubble-sticker" : ""}`}
      style={bubbleStyle}
    >
      {message.message_type === "text" && linkify(message.content)}
      {message.message_type === "image" && (
        <img className="message-image" src={`${API_BASE}${message.file_url}`} alt={message.file_name} />
      )}
      {message.message_type === "file" && (
        <a href={`${API_BASE}${message.file_url}`} target="_blank" rel="noreferrer">
          📄 {message.file_name}
        </a>
      )}
      {message.message_type === "sticker" && (
        message.sticker?.image_url ? (
          <img src={message.sticker.image_url} alt={message.sticker.name} className="message-sticker-image" />
        ) : (
          <span className="message-sticker">{message.sticker?.emoji}</span>
        )
      )}
      {message.message_type === "money" && (
        <span className="message-money">
          💸 {message.amount?.toLocaleString()}원 → {usernameOf(message.recipient_id)}
        </span>
      )}
    </div>
  );
}
