const STORAGE_KEY = "malbanggu_theme_mode"; // "auto" | "light" | "dark"

export function getThemeMode() {
  return localStorage.getItem(STORAGE_KEY) || "auto";
}

export function setThemeMode(mode) {
  localStorage.setItem(STORAGE_KEY, mode);
  applyTheme();
}

export function applyTheme() {
  const mode = getThemeMode();
  const resolved =
    mode === "auto"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
  document.documentElement.dataset.theme = resolved;
}
