export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "rent4set-theme";
export const THEME_CHANGE_EVENT = "rent4set-theme-change";

export function getStoredTheme(): ThemePreference {
  const theme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return theme === "light" || theme === "dark" || theme === "system" ? theme : "system";
}

export function applyTheme(theme: ThemePreference) {
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export function saveTheme(theme: ThemePreference) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
}
