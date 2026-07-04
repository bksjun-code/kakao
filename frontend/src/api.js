const API_BASE = "";

class ApiError extends Error {
  constructor(status, detail) {
    super(typeof detail === "string" ? detail : JSON.stringify(detail));
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, { method = "GET", token, body, isFormData } = {}) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body && !isFormData) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.detail ?? res.statusText);
  return data;
}

export const api = {
  signup: (username, password, securityQuestion, securityAnswer) =>
    request("/auth/signup", {
      method: "POST",
      body: {
        username,
        password,
        security_question: securityQuestion,
        security_answer: securityAnswer,
      },
    }),
  login: (username, password) => request("/auth/login", { method: "POST", body: { username, password } }),
  checkUsername: (username) => request(`/auth/check-username?username=${encodeURIComponent(username)}`),
  getSecurityQuestion: (username) =>
    request(`/auth/security-question?username=${encodeURIComponent(username)}`),
  resetPassword: (username, securityAnswer, newPassword) =>
    request("/auth/reset-password", {
      method: "POST",
      body: { username, security_answer: securityAnswer, new_password: newPassword },
    }),
  me: (token) => request("/users/me", { token }),
  updateNickname: (token, nickname) => request("/users/me", { method: "PATCH", token, body: { nickname } }),
  listUsers: (token) => request("/users", { token }),
  createRoom: (token, userIds, name) => request("/rooms", { method: "POST", token, body: { user_ids: userIds, name } }),
  listRooms: (token) => request("/rooms", { token }),
  addRoomMembers: (token, roomId, userIds) =>
    request(`/rooms/${roomId}/members`, { method: "POST", token, body: { user_ids: userIds } }),
  leaveRoom: (token, roomId) => request(`/rooms/${roomId}/members/me`, { method: "DELETE", token }),
  getMessages: (token, roomId) => request(`/rooms/${roomId}/messages`, { token }),
  markRoomRead: (token, roomId) => request(`/rooms/${roomId}/read`, { method: "POST", token }),
  listStickers: () => request("/stickers"),
  getWallet: (token) => request("/wallet/me", { token }),
  upload: (token, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request("/upload", { method: "POST", token, body: formData, isFormData: true });
  },
};

export function wsUrl(path, token) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${path}?token=${encodeURIComponent(token)}`;
}

export { API_BASE, ApiError };
