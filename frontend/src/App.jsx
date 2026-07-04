import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PresenceProvider } from "./context/PresenceContext";
import { AppearanceProvider } from "./context/AppearanceContext";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ChatRoomPage from "./pages/ChatRoomPage";

function RequireAuth({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/rooms/:roomId"
        element={
          <RequireAuth>
            <ChatRoomPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PresenceProvider>
        <AppearanceProvider>
          <AppRoutes />
        </AppearanceProvider>
      </PresenceProvider>
    </AuthProvider>
  );
}
