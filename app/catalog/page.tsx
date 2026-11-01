import CatalogBrowser from "../components/CatalogBrowser";
import RentalFooter from "../../components/RentalFooter";
import RentalHeader from "../../components/RentalHeader";
import { getPublicCatalog } from "../../lib/catalog";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { getViewer } from "../../lib/viewer";

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const [{ items, setupError }, viewer, filters] = await Promise.all([getPublicCatalog(), getViewer(), searchParams]);
  const isAdmin = viewer.role === "admin";
  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white"><RentalHeader role={viewer.role} quoteCount={viewer.quoteCount} /><section className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><p className="text-xs font-bold uppercase text-[#f54449]">Equipment catalog</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Build your equipment list</h1>{!isSupabaseConfigured && <p className="mt-6 border border-slate-300 p-4 text-sm text-slate-600 dark:border-[#3a3a3e] dark:text-[#aaaab1]">Connect Supabase to load your catalog.</p>}{setupError && <p className="mt-6 border border-slate-300 p-4 text-sm text-slate-600 dark:border-[#3a3a3e] dark:text-[#aaaab1]">Run the catalog schema in Supabase, then refresh.</p>}<CatalogBrowser items={items} userId={!isAdmin ? viewer.user?.id : undefined} showSetTools={!isAdmin} initialQuery={filters.q ?? ""} initialCategory={filters.category ?? "all"} /></section><RentalFooter /></main>;
}
