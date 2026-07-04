import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppearance } from "../context/AppearanceContext";
import { getThemeMode, setThemeMode } from "../theme";
import { api, resolveImageUrl } from "../api";
import { Button } from "./Button";
import ImageCropDialog from "./ImageCropDialog";

const BG_PRESETS = [
  { label: "기본", value: null },
  { label: "아이보리", value: "#faf3e6" },
  { label: "민트", value: "#e3f6f2" },
  { label: "라벤더", value: "#eee6fb" },
  { label: "핑크", value: "#fbe6ee" },
  { label: "다크그레이", value: "#1c1c1e" },
];

const SHAPE_OPTIONS = [
  { label: "각진 사각형", value: "square" },
  { label: "둥근 사각형", value: "rounded" },
  { label: "알약형", value: "pill" },
];

const AVATAR_TEMPLATES = [
  { label: "남자", value: "/avatars/avatar_male.svg" },
  { label: "여자", value: "/avatars/avatar_female.svg" },
];

export default function SettingsSheet({ open, onClose }) {
  const { token, user, updateNickname, updateProfileImage } = useAuth();
  const { chatBackground, setChatBackground, bubble, setBubble, reset } = useAppearance();

  const [themeMode, setThemeModeState] = useState(getThemeMode());
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [nicknameStatus, setNicknameStatus] = useState(null);
  const [error, setError] = useState(null);
  const [cropSource, setCropSource] = useState(null);

  if (!open) return null;

  const handleThemeChange = (mode) => {
    setThemeModeState(mode);
    setThemeMode(mode);
  };

  const handleSaveNickname = async () => {
    setError(null);
    setNicknameStatus(null);
    try {
      await updateNickname(nickname);
      setNicknameStatus("saved");
    } catch (err) {
      setError(err.detail || err.message);
    }
  };

  const handleProfilePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCropSource(URL.createObjectURL(file));
    e.target.value = "";
  };

  const closeCrop = () => {
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource(null);
  };

  const handleCropConfirm = async (blob) => {
    try {
      const croppedFile = new File([blob], "profile.png", { type: "image/png" });
      const uploaded = await api.upload(token, croppedFile);
      await updateProfileImage(uploaded.file_url);
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      closeCrop();
    }
  };

  const handleAvatarTemplate = async (value) => {
    try {
      await updateProfileImage(value);
    } catch (err) {
      setError(err.detail || err.message);
    }
  };

  const handleBackgroundImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const uploaded = await api.upload(token, file);
      setChatBackground({ type: "image", value: uploaded.file_url });
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose}>
        <div className="sheet-card" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber-row">
          <span className="sheet-grabber" />
        </div>
        <div className="sheet-header">설정</div>

        <div className="sheet-body">
          {error && <div className="error-text">{error}</div>}

          <p className="field-label-plain">프로필 사진</p>
          <div className="profile-photo-row">
            <div className="profile-photo-preview">
              {user?.profile_image_url ? (
                <img src={resolveImageUrl(user.profile_image_url)} alt="프로필 사진" />
              ) : (
                <div className="profile-photo-placeholder" />
              )}
            </div>
            <label className="link-button profile-photo-pick">
              <input type="file" accept="image/*" hidden onChange={handleProfilePhoto} />
              사진 선택
            </label>
          </div>
          <div className="swatch-row">
            {AVATAR_TEMPLATES.map((tpl) => (
              <button
                key={tpl.value}
                className={`avatar-template-swatch${user?.profile_image_url === tpl.value ? " swatch-active" : ""}`}
                title={tpl.label}
                onClick={() => handleAvatarTemplate(tpl.value)}
              >
                <img src={tpl.value} alt={tpl.label} />
              </button>
            ))}
          </div>

          <p className="field-label-plain">테마</p>
          <div className="segmented">
            {[
              { label: "자동", value: "auto" },
              { label: "화이트", value: "light" },
              { label: "다크", value: "dark" },
            ].map((opt) => (
              <button
                key={opt.value}
                className={themeMode === opt.value ? "segmented-active" : ""}
                onClick={() => handleThemeChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <p className="field-label-plain">닉네임</p>
          <div className="inline-form">
            <input
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameStatus(null);
              }}
            />
            <Button size="small" onClick={handleSaveNickname} disabled={!nickname.trim()}>
              저장
            </Button>
          </div>
          {nicknameStatus === "saved" && <div className="success-text">닉네임이 저장되었습니다</div>}

          <p className="field-label-plain">채팅방 배경</p>
          <div className="swatch-row">
            {BG_PRESETS.map((preset) => (
              <button
                key={preset.label}
                className={`swatch${chatBackground.type === "color" && chatBackground.value === preset.value ? " swatch-active" : ""}`}
                style={{ background: preset.value || "var(--surface)" }}
                title={preset.label}
                onClick={() => setChatBackground({ type: "color", value: preset.value })}
              />
            ))}
            <label className="swatch swatch-upload">
              <input type="file" accept="image/*" hidden onChange={handleBackgroundImage} />
              <img src="/photo.png" alt="이미지 업로드" className="swatch-upload-icon" />
            </label>
          </div>

          <p className="field-label-plain">말풍선</p>
          <label className="field-label">
            글자 크기
            <select
              value={bubble.fontSize}
              onChange={(e) => setBubble({ fontSize: Number(e.target.value) })}
            >
              <option value={14}>작게</option>
              <option value={17}>보통</option>
              <option value={20}>크게</option>
            </select>
          </label>

          <div className="color-field-row">
            <label className="field-label">
              글자색
              <input
                type="color"
                value={bubble.textColor || "#ffffff"}
                onChange={(e) => setBubble({ textColor: e.target.value })}
              />
            </label>
            <label className="field-label">
              내 말풍선 배경색
              <input
                type="color"
                value={bubble.myBubbleColor || "#1e6ef4"}
                onChange={(e) => setBubble({ myBubbleColor: e.target.value })}
              />
            </label>
          </div>

          <p className="field-label-plain">말풍선 모양</p>
          <div className="segmented">
            {SHAPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={bubble.shape === opt.value ? "segmented-active" : ""}
                onClick={() => setBubble({ shape: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button className="link-button" style={{ marginTop: 12 }} onClick={reset}>
            채팅 외관 기본값으로 되돌리기
          </button>
        </div>

        <div className="sheet-footer">
          <Button block onClick={onClose}>닫기</Button>
        </div>
      </div>
      </div>

      <ImageCropDialog
        open={!!cropSource}
        imageUrl={cropSource}
        onCancel={closeCrop}
        onConfirm={handleCropConfirm}
      />
    </>
  );
}
