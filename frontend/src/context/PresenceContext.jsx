import { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { wsUrl } from "../api";

const PresenceContext = createContext(null);

export function PresenceProvider({ children }) {
  const { token } = useAuth();
  const wsRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(wsUrl("/ws/presence", token));
    wsRef.current = ws;

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [token]);

  return <PresenceContext.Provider value={{}}>{children}</PresenceContext.Provider>;
}

export function usePresence() {
  return useContext(PresenceContext);
}
