import Link from "next/link";
import { Settings } from "lucide-react";
import { redirect } from "next/navigation";
import AccountSettings from "../../../components/AccountSettings";
import ThemeToggle from "../../../components/ThemeToggle";
import { createClient } from "../../../lib/supabase/server";

export default async function CustomerSettingsPage() {
  const supabase = await createClient(); if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "admin") redirect("/admin/settings");
  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50"><header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white dark:bg-slate-100 dark:text-slate-950">R</span>RENT4SET</Link><div className="flex items-center gap-2"><ThemeToggle /><Link href="/account" className="text-sm text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">My sets</Link></div></div></header><section className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10"><div className="mb-8"><p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"><Settings size={14} />Your account</p><h1 className="text-3xl font-semibold tracking-tight">Settings</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage your appearance, account details, and security.</p></div><AccountSettings email={user.email ?? ""} role="customer" backHref="/account" /></section></main>;
}
