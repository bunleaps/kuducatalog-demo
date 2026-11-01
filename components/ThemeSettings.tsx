"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { applyTheme, getStoredTheme, saveTheme, type ThemePreference } from "./theme";

const options: { value: ThemePreference; label: string; description: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", description: "Bright interface", icon: Sun },
  { value: "dark", label: "Dark", description: "Rental-first look", icon: Moon },
  { value: "system", label: "System", description: "Match this device", icon: Monitor },
];

export default function ThemeSettings() {
  const [theme, setTheme] = useState<ThemePreference>("dark");
  useEffect(() => {
    const stored = getStoredTheme();
    applyTheme(stored);
    const frame = window.requestAnimationFrame(() => setTheme(stored));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  function select(value: ThemePreference) { setTheme(value); saveTheme(value); }
  return <div className="grid gap-2 sm:grid-cols-3">{options.map(({ value, label, description, icon: Icon }) => <button type="button" key={value} onClick={() => select(value)} className={cn("flex min-h-24 items-start gap-3 border p-4 text-left transition-colors", theme === value ? "border-[#f54449] bg-red-50 text-slate-950 dark:bg-[#26191b] dark:text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400 hover:text-slate-950 dark:border-[#3a3a3e] dark:bg-[#111113] dark:text-[#a4a4aa] dark:hover:border-[#66666d] dark:hover:text-white")} aria-pressed={theme === value}><Icon size={18} className={theme === value ? "text-[#f54449]" : "text-slate-400 dark:text-[#85858c]"} /><span><span className="block text-sm font-bold uppercase">{label}</span><span className="mt-1 block text-xs font-normal normal-case text-slate-500 dark:text-[#818188]">{description}</span></span></button>)}</div>;
}
