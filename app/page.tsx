import Link from "next/link";
import { Heart, LayoutDashboard, LogIn, Settings } from "lucide-react";
import CatalogBrowser from "./components/CatalogBrowser";
import ThemeToggle from "../components/ThemeToggle";
import { getPublicCatalog } from "../lib/catalog";
import { isSupabaseConfigured } from "../lib/supabase/config";
import { createClient } from "../lib/supabase/server";

export default async function Home() {
  const { items, setupError } = await getPublicCatalog();
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: profile } = supabase && user ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
  const isAdmin = profile?.role === "admin";
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white dark:bg-slate-100 dark:text-slate-950">R</span>RENT4SET</Link><nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><ThemeToggle />{isAdmin ? <><Link href="/admin" className="flex items-center gap-1.5 transition hover:text-slate-950 dark:hover:text-white"><LayoutDashboard size={15} /><span className="hidden sm:inline">Admin</span></Link><Link href="/admin/settings" className="flex items-center gap-1.5 transition hover:text-slate-950 dark:hover:text-white" aria-label="Settings"><Settings size={15} /><span className="hidden md:inline">Settings</span></Link></> : user ? <><Link href="/account" className="flex items-center gap-1.5 transition hover:text-slate-950 dark:hover:text-white"><Heart size={15} /><span className="hidden sm:inline">My sets</span></Link><Link href="/account/settings" className="flex items-center gap-1.5 transition hover:text-slate-950 dark:hover:text-white" aria-label="Settings"><Settings size={15} /><span className="hidden md:inline">Settings</span></Link></> : <Link href="/login" className="flex items-center gap-1.5 transition hover:text-slate-950 dark:hover:text-white"><LogIn size={15} />Sign in</Link>}</nav></div></header>
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {!isSupabaseConfigured && <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Connect Supabase to load your catalog. Add the environment variables listed in the project README.</div>}
        {setupError && <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Supabase is connected, but the catalog table is not set up yet. Run <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-900 dark:bg-slate-800 dark:text-slate-100">supabase/schema.sql</code> in your Supabase SQL Editor, then refresh.</div>}
        <CatalogBrowser items={items} userId={!isAdmin ? user?.id : undefined} showSetTools={!isAdmin} />
      </section>
      <footer className="mx-auto flex w-full max-w-6xl justify-between border-t border-slate-200 px-4 py-6 text-xs text-slate-500 sm:px-6 dark:border-slate-800 dark:text-slate-400"><span>RENT4SET</span><span>Camera and production equipment.</span></footer>
    </main>
  );
}
