import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "malbanggu_appearance";

export const BUBBLE_SHAPES = {
  square: { radius: "4px", tailRadius: "4px" },
  rounded: { radius: "14px", tailRadius: "5px" },
  pill: { radius: "999px", tailRadius: "999px" },
};

const DEFAULTS = {
  chatBackground: { type: "color", value: null }, // value: null = default surface color
  bubble: {
    fontSize: 17,
    textColor: null, // null = use default per-bubble (white on mine, primary on theirs)
    myBubbleColor: null, // null = use --tint
    shape: "rounded",
  },
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      chatBackground: { ...DEFAULTS.chatBackground, ...parsed.chatBackground },
      bubble: { ...DEFAULTS.bubble, ...parsed.bubble },
    };
  } catch {
    return DEFAULTS;
  }
}

const AppearanceContext = createContext(null);

export function AppearanceProvider({ children }) {
  const [appearance, setAppearance] = useState(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
  }, [appearance]);

  const setChatBackground = (chatBackground) =>
    setAppearance((prev) => ({ ...prev, chatBackground }));
  const setBubble = (bubble) =>
    setAppearance((prev) => ({ ...prev, bubble: { ...prev.bubble, ...bubble } }));
  const reset = () => setAppearance(DEFAULTS);

  return (
    <AppearanceContext.Provider
      value={{ ...appearance, setChatBackground, setBubble, reset }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error("useAppearance must be used within AppearanceProvider");
  return ctx;
}
