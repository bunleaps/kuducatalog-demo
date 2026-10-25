"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { applyTheme, getStoredTheme, saveTheme, type ThemePreference } from "./theme";

const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function ThemeSettings() {
  const [theme, setTheme] = useState<ThemePreference>("system");
  useEffect(() => { const stored = getStoredTheme(); setTheme(stored); applyTheme(stored); }, []);
  function select(value: ThemePreference) { setTheme(value); saveTheme(value); }
  return <div className="grid grid-cols-3 gap-2">{options.map(({ value, label, icon: Icon }) => <button type="button" key={value} onClick={() => select(value)} className={cn("flex flex-col items-center gap-2 rounded-lg border px-3 py-4 text-sm font-medium transition", theme === value ? "border-slate-900 bg-slate-100 text-slate-950 dark:border-slate-100 dark:bg-slate-800 dark:text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800")} aria-pressed={theme === value}><Icon size={18} />{label}</button>)}</div>;
}
