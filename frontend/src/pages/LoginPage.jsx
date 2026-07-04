import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { Button } from "../components/Button";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // login | signup | reset
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [usernameCheck, setUsernameCheck] = useState(null); // null | 'checking' | 'available' | 'taken' | 'error'
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // password reset state
  const [resetStep, setResetStep] = useState(1);
  const [resetUsername, setResetUsername] = useState("");
  const [resetQuestion, setResetQuestion] = useState("");
  const [resetAnswer, setResetAnswer] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetDone, setResetDone] = useState(false);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError(null);
    setUsernameCheck(null);
    setResetStep(1);
    setResetDone(false);
  };

  const handleCheckUsername = async () => {
    if (!username) return;
    setUsernameCheck("checking");
    try {
      const res = await api.checkUsername(username);
      setUsernameCheck(res.available ? "available" : "taken");
    } catch {
      setUsernameCheck("error");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && (!securityQuestion.trim() || !securityAnswer.trim())) {
      setError("비밀번호 찾기용 질문과 답변을 모두 입력해주세요.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        if (usernameCheck !== "available") {
          const res = await api.checkUsername(username);
          if (!res.available) {
            setUsernameCheck("taken");
            throw new Error("이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.");
          }
          setUsernameCheck("available");
        }
        await signup(username, password, securityQuestion, securityAnswer);
      }
      navigate("/");
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleFetchQuestion = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.getSecurityQuestion(resetUsername);
      setResetQuestion(res.security_question);
      setResetStep(2);
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.resetPassword(resetUsername, resetAnswer, resetNewPassword);
      setResetDone(true);
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      setBusy(false);
    }
  };

  if (mode === "reset") {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1 className="brand">말방구</h1>
          <p className="brand-tagline">비밀번호 찾기</p>

          {resetDone ? (
            <>
              <p>비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해주세요.</p>
              <Button block onClick={() => switchMode("login")}>로그인하러 가기</Button>
            </>
          ) : resetStep === 1 ? (
            <form onSubmit={handleFetchQuestion}>
              <input
                placeholder="아이디"
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value)}
                autoFocus
              />
              {error && <div className="error-text">{error}</div>}
              <Button block type="submit" disabled={busy || !resetUsername}>다음</Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <p className="subtle">{resetQuestion}</p>
              <input
                placeholder="답변"
                value={resetAnswer}
                onChange={(e) => setResetAnswer(e.target.value)}
                autoFocus
              />
              <input
                placeholder="새 비밀번호"
                type="password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
              />
              {error && <div className="error-text">{error}</div>}
              <Button block type="submit" disabled={busy || !resetAnswer || !resetNewPassword}>
                비밀번호 재설정
              </Button>
            </form>
          )}

          <button className="link-button" onClick={() => switchMode("login")}>
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="brand">말방구</h1>
        <p className="brand-tagline">가볍게 주고받는 나만의 채팅</p>

        <form onSubmit={submit}>
          <div className="username-row">
            <input
              placeholder="아이디"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameCheck(null);
              }}
              autoFocus
            />
            {mode === "signup" && (
              <Button variant="filled" size="small" onClick={handleCheckUsername} disabled={!username}>
                중복확인
              </Button>
            )}
          </div>
          {mode === "signup" && usernameCheck === "checking" && (
            <div className="subtle">확인 중...</div>
          )}
          {mode === "signup" && usernameCheck === "available" && (
            <div className="success-text">사용 가능한 아이디입니다</div>
          )}
          {mode === "signup" && usernameCheck === "taken" && (
            <div className="error-text">이미 사용 중인 아이디입니다</div>
          )}

          <input
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {mode === "signup" && (
            <>
              <label className="field-label">
                비밀번호 찾기 질문
                <input
                  placeholder="예: 다니던 초등학교 이름은?"
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                />
              </label>
              <label className="field-label">
                질문에 대한 답
                <input
                  placeholder="예: 서울초등학교"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                />
              </label>
            </>
          )}

          {error && <div className="error-text">{error}</div>}
          <Button block type="submit" disabled={busy || !username || !password}>
            {mode === "login" ? "로그인" : "회원가입"}
          </Button>
        </form>

        {mode === "login" && (
          <button className="link-button" onClick={() => switchMode("reset")}>
            비밀번호를 잊으셨나요?
          </button>
        )}

        <button className="link-button" onClick={() => switchMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
        </button>
      </div>
    </div>
  );
}
