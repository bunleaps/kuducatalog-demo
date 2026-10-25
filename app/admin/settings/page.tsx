import Link from "next/link";
import { Settings } from "lucide-react";
import AccountSettings from "../../../components/AccountSettings";
import ThemeToggle from "../../../components/ThemeToggle";
import { requireAdmin } from "../../../lib/auth";
import AdminTabs from "../AdminTabs";

export default async function AdminSettingsPage() {
  const { user } = await requireAdmin();
  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50"><header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white dark:bg-slate-100 dark:text-slate-950">R</span>RENT4SET <span className="font-normal text-slate-400 dark:text-slate-500">/ Admin</span></Link><ThemeToggle /></div></header><AdminTabs active="settings" /><section className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10"><div className="mb-8"><p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"><Settings size={14} />Administrator account</p><h1 className="text-3xl font-semibold tracking-tight">Settings</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage your appearance, account details, and security.</p></div><AccountSettings email={user.email ?? ""} role="admin" backHref="/admin" /></section></main>;
}
