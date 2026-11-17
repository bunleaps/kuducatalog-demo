import CatalogBrowser from "../components/CatalogBrowser";
import RentalFooter from "../../components/RentalFooter";
import RentalHeader from "../../components/RentalHeader";
import ContactRail from "../../components/ContactRail";
import { getPublicCatalog } from "../../lib/catalog";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { getViewer } from "../../lib/viewer";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; set?: string }> }) {
  const [{ items, setupError }, viewer, filters] = await Promise.all([getPublicCatalog(), getViewer(), searchParams]);
  const isAdmin = viewer.role === "admin";
  const { data: targetSet } = viewer.role === "customer" && filters.set && uuidPattern.test(filters.set)
    ? await viewer.supabase!.from("project_sets").select("id,title").eq("id", filters.set).eq("user_id", viewer.user.id).maybeSingle()
    : { data: null };
  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white"><RentalHeader role={viewer.role} quoteCount={viewer.quoteCount} favoriteCount={viewer.favoriteCount} /><ContactRail /><section className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><p className="text-xs font-bold uppercase text-[#f54449]">Equipment catalog</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{targetSet ? `Add equipment to ${targetSet.title}` : "Build your equipment list"}</h1>{targetSet && <p className="mt-3 text-sm text-slate-500 dark:text-[#929299]">Selections on this page are added directly to this saved quote list.</p>}{!isSupabaseConfigured && <p className="mt-6 border border-slate-300 p-4 text-sm text-slate-600 dark:border-[#3a3a3e] dark:text-[#aaaab1]">Connect Supabase to load your catalog.</p>}{setupError && <p className="mt-6 border border-slate-300 p-4 text-sm text-slate-600 dark:border-[#3a3a3e] dark:text-[#aaaab1]">Run the catalog schema in Supabase, then refresh.</p>}<CatalogBrowser items={items} userId={!isAdmin ? viewer.user?.id : undefined} showSetTools={!isAdmin} initialQuery={filters.q ?? ""} initialCategory={filters.category ?? "all"} targetSetId={targetSet?.id} /></section><RentalFooter /></main>;
}
