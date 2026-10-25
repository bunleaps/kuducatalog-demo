"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { applyTheme, getStoredTheme, saveTheme, THEME_CHANGE_EVENT, type ThemePreference } from "./theme";

function resolvedDark(theme: ThemePreference) {
  return theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => { const theme = getStoredTheme(); applyTheme(theme); setIsDark(resolvedDark(theme)); };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener(THEME_CHANGE_EVENT, sync);
    return () => { media.removeEventListener("change", sync); window.removeEventListener(THEME_CHANGE_EVENT, sync); };
  }, []);

  return <Button type="button" variant="ghost" size="sm" className="size-9 px-0" onClick={() => saveTheme(isDark ? "light" : "dark")} aria-label={isDark ? "Use light mode" : "Use dark mode"} title={isDark ? "Use light mode" : "Use dark mode"}>{isDark ? <Sun size={16} /> : <Moon size={16} />}</Button>;
}
