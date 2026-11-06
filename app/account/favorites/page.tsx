import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import CatalogBrowser from "../../components/CatalogBrowser";
import RentalFooter from "../../../components/RentalFooter";
import RentalHeader from "../../../components/RentalHeader";
import { getPublicCatalog } from "../../../lib/catalog";
import { getViewer } from "../../../lib/viewer";

export default async function FavoritesPage() {
  const viewer = await getViewer();
  if (!viewer.user) redirect("/login");
  if (viewer.role === "admin") redirect("/admin");
  const [{ items }, { data }] = await Promise.all([getPublicCatalog(), viewer.supabase!.from("favorites").select("catalog_item_id")]);
  const favoriteIds = new Set((data ?? []).map((row) => row.catalog_item_id));
  const favorites = items.filter((item) => favoriteIds.has(item.id));
  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white"><RentalHeader role="customer" quoteCount={viewer.quoteCount} favoriteCount={viewer.favoriteCount} /><section className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><p className="flex items-center gap-2 text-xs font-bold uppercase text-[#f54449]"><Heart size={14} />Saved equipment</p><h1 className="mt-3 text-4xl font-black">Favorites</h1><p className="mt-2 text-sm text-slate-500 dark:text-[#929299]">Keep interesting equipment here without adding it to a quote list yet.</p>{favorites.length ? <CatalogBrowser items={favorites} userId={viewer.user.id} /> : <div className="mt-8 border border-dashed border-slate-300 px-6 py-16 text-center dark:border-[#3a3a3e]"><Heart className="mx-auto text-slate-400" /><h2 className="mt-4 font-bold">No favorites yet</h2><p className="mt-2 text-sm text-slate-500">Use the heart button in the catalog to save equipment for later.</p></div>}</section><RentalFooter /></main>;
}
