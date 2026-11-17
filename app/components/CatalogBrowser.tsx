"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, Heart, Info, RotateCcw, Search, ShoppingCart, SlidersHorizontal } from "lucide-react";
import type { CatalogItem } from "../../lib/catalog";
import { addItemToCart, getGuestCartIds, loadActiveCart, notifyCartUpdated } from "../../lib/cart-client";
import { Button } from "../../components/ui/button";
import { Select } from "../../components/ui/select";
import { createClient } from "../../lib/supabase/client";

const normalizeText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function CatalogBrowser({ items, userId, showSetTools = true, initialQuery = "", initialCategory = "all", targetSetId }: { items: CatalogItem[]; userId?: string; showSetTools?: boolean; initialQuery?: string; initialCategory?: string; targetSetId?: string }) {
  const router = useRouter();
  const categories = Array.from(new Set(items.map((item) => item.category.trim()))).filter(Boolean).sort((a, b) => a.localeCompare(b));
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : "all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(12);
  const [cartItemIds, setCartItemIds] = useState<Set<string>>(new Set());
  const [addingCartItem, setAddingCartItem] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteBusy, setFavoriteBusy] = useState<string | null>(null);
  const [cartError, setCartError] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    const result = items.filter((item) => (!normalizedQuery || normalizeText(`${item.title} ${item.category} ${item.description ?? ""}`).includes(normalizedQuery)) && (category === "all" || item.category.trim() === category) && (!availableOnly || item.availability === "available"));
    return sort === "name" ? [...result].sort((a, b) => a.title.localeCompare(b.title)) : result;
  }, [availableOnly, category, items, query, sort]);

  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => setCartItemIds(new Set(getGuestCartIds())));
      return;
    }
    const browserClient = createClient(); if (!browserClient) return;
    const supabaseClient = browserClient;
    async function loadSelection() {
      if (targetSetId) {
        const [setItemsResult, favoritesResult] = await Promise.all([
          supabaseClient.from("project_set_items").select("catalog_item_id").eq("project_set_id", targetSetId),
          supabaseClient.from("favorites").select("catalog_item_id"),
        ]);
        if (setItemsResult.error) throw setItemsResult.error;
        setCartItemIds(new Set((setItemsResult.data ?? []).map((row) => row.catalog_item_id)));
        setFavoriteIds(new Set((favoritesResult.data ?? []).map((row) => row.catalog_item_id)));
        return;
      }
      const [cart, favoritesResult] = await Promise.all([
        loadActiveCart(supabaseClient),
        supabaseClient.from("favorites").select("catalog_item_id"),
      ]);
      setCartItemIds(cart.itemIds);
      setFavoriteIds(new Set((favoritesResult.data ?? []).map((row) => row.catalog_item_id)));
    }
    void loadSelection().catch(() => setCartError("Unable to load your saved equipment selections."));
  }, [targetSetId, userId]);

  async function toggleFavorite(itemId: string) {
    if (!userId) { router.push("/login"); return; }
    const supabase = createClient(); if (!supabase) return;
    const isFavorite = favoriteIds.has(itemId);
    setFavoriteBusy(itemId);
    const { error } = isFavorite
      ? await supabase.from("favorites").delete().eq("catalog_item_id", itemId)
      : await supabase.from("favorites").insert({ user_id: userId, catalog_item_id: itemId });
    if (!error) {
      setFavoriteIds((current) => { const next = new Set(current); if (isFavorite) next.delete(itemId); else next.add(itemId); return next; });
      router.refresh();
    }
    setFavoriteBusy(null);
  }

  async function addCartItem(itemId: string) {
    if (cartItemIds.has(itemId)) return;
    setAddingCartItem(itemId); setCartError("");
    try {
      if (targetSetId) {
        const supabase = createClient();
        if (!supabase) throw new Error("Supabase is not configured.");
        const { error } = await supabase.from("project_set_items").insert({ project_set_id: targetSetId, catalog_item_id: itemId, quantity: 1 });
        if (error) throw error;
        const activeCart = await loadActiveCart(supabase);
        notifyCartUpdated(activeCart.itemCount);
      } else {
        await addItemToCart(itemId, userId);
      }
      setCartItemIds((current) => new Set(current).add(itemId));
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Unable to add this equipment.");
    } finally {
      setAddingCartItem(null);
    }
  }

  const clear = () => { setQuery(""); setCategory("all"); setAvailableOnly(false); };
  const availabilityLabel = (value: string) => value === "available" ? "Available" : value === "limited" ? "Limited availability" : "Unavailable";

  return <>
    <div className="relative z-30 mt-7 grid border border-slate-200 bg-white dark:border-[#343438] dark:bg-[#1a1a1d] sm:grid-cols-[1fr_220px_130px]">
      <label className="flex h-14 items-center gap-3 px-5"><Search size={17} className="text-slate-400" /><input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cameras, lenses, lighting, grip…" /></label>
      <Select ariaLabel="Equipment category" value={category} onValueChange={setCategory} options={[{ value: "all", label: "All categories" }, ...categories.map((option) => ({ value: option, label: option }))]} className="border-y border-slate-200 dark:border-[#343438] sm:border-x sm:border-y-0" triggerClassName="h-14 border-0 bg-transparent px-5 text-xs font-bold uppercase hover:bg-slate-50 focus-visible:ring-inset dark:bg-transparent dark:hover:bg-[#222225]" menuClassName="mt-0 border-t-0 text-xs uppercase" />
      <button className="h-14 bg-[#f54449] text-xs font-bold uppercase text-white hover:bg-[#ff565b]">Search</button>
    </div>

    <div className="mt-5 flex flex-wrap justify-center gap-2">{["all", ...categories].map((option) => <button key={option} onClick={() => setCategory(option)} className={`whitespace-nowrap border px-4 py-2 text-xs font-bold uppercase transition ${category === option ? "border-[#f54449] bg-[#f54449] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-[#f54449] hover:text-[#f54449] dark:border-[#343438] dark:bg-[#1a1a1d] dark:text-[#c0c0c6]"}`}>{option === "all" ? "All equipment" : option}</button>)}</div>

    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-4 dark:border-[#343438]"><div className="flex flex-wrap items-center gap-4"><span className="flex items-center gap-2 text-xs font-bold uppercase"><SlidersHorizontal size={14} />Filters</span><label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} className="accent-[#f54449]" />Available now</label>{(query || category !== "all" || availableOnly) && <button onClick={clear} className="flex items-center gap-2 text-xs font-bold uppercase text-[#f54449]"><RotateCcw size={13} />Clear</button>}</div><div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#9b9ba2]"><span>Sort:</span><Select ariaLabel="Sort equipment" value={sort} onValueChange={setSort} options={[{ value: "featured", label: "Featured" }, { value: "name", label: "Name" }]} className="w-36" triggerClassName="h-9 border-slate-200 bg-white px-3 font-medium dark:border-[#343438] dark:bg-[#1a1a1d]" menuClassName="right-0 left-auto min-w-36" /></div></div>

    <div className="mt-6 text-sm text-slate-500 dark:text-[#9b9ba2]">{filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}</div>
    {cartError && <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{cartError}</p>}
    {filteredItems.length ? <><section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredItems.slice(0, visibleCount).map((item) => { const image = item.featured_media || item.media?.[0]; const isFavorite = favoriteIds.has(item.id); const isInCart = cartItemIds.has(item.id); const selectionName = targetSetId ? "list" : "cart"; const detailHref = targetSetId ? `/catalog/${item.id}?set=${targetSetId}` : `/catalog/${item.id}`; return <article key={item.id} className="group flex min-h-full flex-col border border-slate-200 bg-white p-3 transition hover:border-[#f54449] dark:border-[#343438] dark:bg-[#1a1a1d]"><div className="relative"><Link href={detailHref} className="block aspect-[4/3] overflow-hidden bg-[#f5f5f5]">{image ? <img src={image} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" /> : <span className="grid h-full place-items-center text-sm text-slate-400">No image</span>}</Link>{isInCart && <span className="absolute left-2 top-2 z-20 flex items-center gap-1 bg-emerald-600 px-2 py-1 text-[10px] font-bold uppercase text-white"><Check size={12} />In {selectionName}</span>}<div className="absolute inset-0 z-10 flex items-center justify-center gap-3 bg-black/55 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"><Link href={detailHref} aria-label={`View details for ${item.title}`} title="View details" className="grid size-11 place-items-center border border-white/50 bg-[#171719]/90 text-white transition hover:border-[#f54449] hover:bg-[#f54449]"><Info size={19} /></Link>{showSetTools && item.availability !== "unavailable" && <button onClick={() => addCartItem(item.id)} disabled={isInCart || addingCartItem === item.id} aria-label={isInCart ? `${item.title} is in your ${selectionName}` : `Add ${item.title} to ${selectionName}`} title={isInCart ? `Already in ${selectionName}` : `Add to ${selectionName}`} className={`grid size-11 place-items-center border text-white transition ${isInCart ? "border-emerald-500 bg-emerald-600" : "border-white/50 bg-[#171719]/90 hover:border-[#f54449] hover:bg-[#f54449]"}`}>{isInCart ? <Check size={19} /> : <ShoppingCart size={19} />}</button>}</div><button onClick={() => toggleFavorite(item.id)} disabled={favoriteBusy === item.id} className={`absolute right-2 top-2 z-20 grid size-9 place-items-center border bg-white shadow-sm transition hover:text-[#f54449] dark:border-[#343438] dark:bg-[#151517] ${isFavorite ? "border-[#f54449] text-[#f54449]" : "border-slate-200 text-slate-600 dark:text-[#c0c0c6]"}`} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}><Heart size={16} fill={isFavorite ? "currentColor" : "none"} /></button></div><p className="mt-4 text-[11px] font-bold uppercase text-[#f54449]">{item.category}</p><Link href={detailHref} className="mt-1 line-clamp-2 text-base font-bold hover:text-[#f54449]">{item.title}</Link><div className="mt-auto flex items-center justify-between gap-3 pt-4"><span className={`border px-2.5 py-1 text-[11px] font-bold uppercase ${item.availability === "available" ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" : item.availability === "limited" ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300" : "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"}`}>{availabilityLabel(item.availability)}</span><span className="shrink-0 text-right text-sm font-black text-slate-950 dark:text-white">{item.daily_rate === null ? "Contact" : <>{usd.format(item.daily_rate)}<span className="ml-1 text-[10px] font-medium uppercase text-slate-500 dark:text-[#929299]">/ day</span></>}</span></div></article>; })}</section>{visibleCount < filteredItems.length && <div className="mt-8 text-center"><Button variant="outline" size="lg" onClick={() => setVisibleCount((count) => count + 12)}>Load more equipment</Button></div>}</> : <div className="mt-5 border border-dashed border-slate-300 px-6 py-16 text-center dark:border-[#3a3a3e]"><h2 className="font-bold">No equipment matches these filters.</h2><p className="mt-2 text-sm text-slate-500 dark:text-[#96969d]">Try another search or clear the current filters.</p></div>}
  </>;
}
