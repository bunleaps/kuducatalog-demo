import { Settings } from "lucide-react";
import AccountSettings from "../../../components/AccountSettings";
import AdminHeader from "../../../components/AdminHeader";
import RentalFooter from "../../../components/RentalFooter";
import { requireAdmin } from "../../../lib/auth";
import AdminTabs from "../AdminTabs";

export default async function AdminSettingsPage() {
  const { user } = await requireAdmin();
  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white"><AdminHeader /><AdminTabs active="settings" /><section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14"><div className="mb-9 border-b border-slate-200 pb-7 dark:border-[#303034]"><p className="flex items-center gap-2 text-xs font-bold uppercase text-[#f54449]"><Settings size={14} />Administrator account</p><h1 className="mt-3 text-4xl font-black">Settings</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-[#929299]">Manage administrator access, appearance and the current session.</p></div><AccountSettings email={user.email ?? ""} role="admin" backHref="/admin" /></section><RentalFooter /></main>;
}
