import { Settings } from "lucide-react";
import { redirect } from "next/navigation";
import AccountSettings from "../../../components/AccountSettings";
import RentalFooter from "../../../components/RentalFooter";
import RentalHeader from "../../../components/RentalHeader";
import { createClient } from "../../../lib/supabase/server";

export default async function CustomerSettingsPage() {
  const supabase = await createClient(); if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const [{ data: profile }, { count }, { count: favoriteCount }] = await Promise.all([
    supabase.from("profiles").select("role,display_name").eq("id", user.id).maybeSingle(),
    supabase.from("project_sets").select("id", { count: "exact", head: true }),
    supabase.from("favorites").select("catalog_item_id", { count: "exact", head: true }),
  ]);
  if (profile?.role === "admin") redirect("/admin/settings");
  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white"><RentalHeader role="customer" quoteCount={count ?? 0} favoriteCount={favoriteCount ?? 0} /><section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14"><div className="mb-9 border-b border-slate-200 pb-7 dark:border-[#303034]"><p className="flex items-center gap-2 text-xs font-bold uppercase text-[#f54449]"><Settings size={14} />Client account</p><h1 className="mt-3 text-4xl font-black">Settings</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-[#929299]">Manage your account access, appearance and active session.</p></div><AccountSettings email={user.email ?? ""} displayName={profile?.display_name ?? ""} role="customer" backHref="/account" /></section><RentalFooter /></main>;
}
