import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("malbanggu_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("malbanggu_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("malbanggu_token", token);
    else localStorage.removeItem("malbanggu_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("malbanggu_user", JSON.stringify(user));
    else localStorage.removeItem("malbanggu_user");
  }, [user]);

  const applyAuth = (data) => {
    setToken(data.access_token);
    setUser(data.user);
  };

  const signup = async (username, password, securityQuestion, securityAnswer) =>
    applyAuth(await api.signup(username, password, securityQuestion, securityAnswer));
  const login = async (username, password) => applyAuth(await api.login(username, password));
  const logout = () => {
    setToken(null);
    setUser(null);
  };
  const updateNickname = async (nickname) => {
    const updated = await api.updateNickname(token, nickname);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ token, user, signup, login, logout, updateNickname }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
