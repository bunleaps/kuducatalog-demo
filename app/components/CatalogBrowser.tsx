"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookmarkPlus, Check, ChevronDown, FolderHeart, Heart, Info, Plus, RotateCcw, Search, ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import type { CatalogItem } from "../../lib/catalog";
import { Button } from "../../components/ui/button";
import { createClient } from "../../lib/supabase/client";

type ProjectSet = { id: string; title: string };
const normalizeText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();

export default function CatalogBrowser({ items, userId, showSetTools = true, initialQuery = "", initialCategory = "all" }: { items: CatalogItem[]; userId?: string; showSetTools?: boolean; initialQuery?: string; initialCategory?: string }) {
  const router = useRouter();
  const categories = Array.from(new Set(items.map((item) => item.category.trim()))).filter(Boolean).sort((a, b) => a.localeCompare(b));
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : "all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(12);
  const [sets, setSets] = useState<ProjectSet[]>([]);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedSetIdsByItem, setSavedSetIdsByItem] = useState<Record<string, Set<string>>>({});
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteBusy, setFavoriteBusy] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    const result = items.filter((item) => (!normalizedQuery || normalizeText(`${item.title} ${item.category} ${item.description ?? ""}`).includes(normalizedQuery)) && (category === "all" || item.category.trim() === category) && (!availableOnly || item.availability === "available"));
    return sort === "name" ? [...result].sort((a, b) => a.title.localeCompare(b.title)) : result;
  }, [availableOnly, category, items, query, sort]);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient(); if (!supabase) return;
    Promise.all([
      supabase.from("project_sets").select("id,title").order("created_at", { ascending: false }),
      supabase.from("favorites").select("catalog_item_id"),
    ]).then(async ([setsResult, favoritesResult]) => {
      const projectSets = (setsResult.data ?? []) as ProjectSet[];
      setSets(projectSets);
      setFavoriteIds(new Set((favoritesResult.data ?? []).map((row) => row.catalog_item_id)));
      if (!projectSets.length) return;
      const { data: savedItems } = await supabase.from("project_set_items").select("project_set_id,catalog_item_id").in("project_set_id", projectSets.map((set) => set.id));
      const savedSets: Record<string, Set<string>> = {};
      for (const row of savedItems ?? []) { if (!savedSets[row.catalog_item_id]) savedSets[row.catalog_item_id] = new Set(); savedSets[row.catalog_item_id].add(row.project_set_id); }
      setSavedSetIdsByItem(savedSets);
    });
  }, [userId]);

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

  async function saveToSet(projectSetId: string, catalogItemId: string) {
    const supabase = createClient(); if (!supabase) return;
    const key = `${projectSetId}:${catalogItemId}`; setSavingKey(key);
    const { error } = await supabase.from("project_set_items").upsert({ project_set_id: projectSetId, catalog_item_id: catalogItemId, quantity: 1 }, { onConflict: "project_set_id,catalog_item_id" });
    if (!error) setSavedSetIdsByItem((current) => ({ ...current, [catalogItemId]: new Set(current[catalogItemId] ?? []).add(projectSetId) }));
    setSavingKey(null);
  }

  const clear = () => { setQuery(""); setCategory("all"); setAvailableOnly(false); };
  const availabilityLabel = (value: string) => value === "available" ? "Available" : value === "limited" ? "Limited availability" : "Unavailable";

  return <>
    <div className="mt-7 grid overflow-hidden border border-slate-200 bg-white dark:border-[#343438] dark:bg-[#1a1a1d] sm:grid-cols-[1fr_220px_130px]"><label className="flex h-14 items-center gap-3 px-5"><Search size={17} className="text-slate-400" /><input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cameras, lenses, lighting, grip…" /></label><label className="relative"><select className="h-14 w-full appearance-none border-y border-slate-200 bg-transparent px-5 pr-10 text-xs font-bold uppercase outline-none dark:border-[#343438] sm:border-x sm:border-y-0" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-4 top-5" /></label><button className="h-14 bg-[#f54449] text-xs font-bold uppercase text-white hover:bg-[#ff565b]">Search</button></div>

    <div className="mt-5 flex gap-2 overflow-x-auto pb-2">{["all", ...categories].map((option) => <button key={option} onClick={() => setCategory(option)} className={`shrink-0 border px-4 py-2 text-xs font-bold uppercase transition ${category === option ? "border-[#f54449] bg-[#f54449] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-[#f54449] hover:text-[#f54449] dark:border-[#343438] dark:bg-[#1a1a1d] dark:text-[#c0c0c6]"}`}>{option === "all" ? "All equipment" : option}</button>)}</div>

    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-4 dark:border-[#343438]"><div className="flex flex-wrap items-center gap-4"><span className="flex items-center gap-2 text-xs font-bold uppercase"><SlidersHorizontal size={14} />Filters</span><label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} className="accent-[#f54449]" />Available now</label>{(query || category !== "all" || availableOnly) && <button onClick={clear} className="flex items-center gap-2 text-xs font-bold uppercase text-[#f54449]"><RotateCcw size={13} />Clear</button>}</div><label className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#9b9ba2]">Sort:<select className="bg-transparent font-medium text-slate-950 outline-none dark:text-white" value={sort} onChange={(event) => setSort(event.target.value)}><option className="bg-white dark:bg-[#1a1a1d]" value="featured">Featured</option><option className="bg-white dark:bg-[#1a1a1d]" value="name">Name</option></select></label></div>

    <div className="mt-6 text-sm text-slate-500 dark:text-[#9b9ba2]">{filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}</div>
    {filteredItems.length ? <><section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredItems.slice(0, visibleCount).map((item) => { const image = item.featured_media || item.media?.[0]; const isFavorite = favoriteIds.has(item.id); return <article key={item.id} className="group flex min-h-full flex-col border border-slate-200 bg-white p-3 transition hover:border-[#f54449] dark:border-[#343438] dark:bg-[#1a1a1d]"><div className="relative"><Link href={`/catalog/${item.id}`} className="block aspect-[4/3] overflow-hidden bg-[#f5f5f5]">{image ? <img src={image} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" /> : <span className="grid h-full place-items-center text-sm text-slate-400">No image</span>}</Link><div className="absolute inset-0 z-10 flex items-center justify-center gap-3 bg-black/55 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"><Link href={`/catalog/${item.id}`} aria-label={`View details for ${item.title}`} title="View details" className="grid size-11 place-items-center border border-white/50 bg-[#171719]/90 text-white transition hover:border-[#f54449] hover:bg-[#f54449]"><Info size={19} /></Link>{showSetTools && item.availability !== "unavailable" && <button onClick={() => setSelectedItem(item)} aria-label={`Add ${item.title} to a quote list`} title="Add to quote list" className="grid size-11 place-items-center border border-white/50 bg-[#171719]/90 text-white transition hover:border-[#f54449] hover:bg-[#f54449]"><ShoppingCart size={19} /></button>}</div><button onClick={() => toggleFavorite(item.id)} disabled={favoriteBusy === item.id} className={`absolute right-2 top-2 z-20 grid size-9 place-items-center border bg-white shadow-sm transition hover:text-[#f54449] dark:border-[#343438] dark:bg-[#151517] ${isFavorite ? "border-[#f54449] text-[#f54449]" : "border-slate-200 text-slate-600 dark:text-[#c0c0c6]"}`} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}><Heart size={16} fill={isFavorite ? "currentColor" : "none"} /></button></div><p className="mt-4 text-[11px] font-bold uppercase text-[#f54449]">{item.category}</p><Link href={`/catalog/${item.id}`} className="mt-1 line-clamp-2 text-base font-bold hover:text-[#f54449]">{item.title}</Link><div className="mt-auto flex items-end justify-between gap-3 pt-4"><span className={`border px-2.5 py-1 text-[11px] font-bold uppercase ${item.availability === "available" ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400" : item.availability === "limited" ? "border-amber-500/50 text-amber-600 dark:text-amber-400" : "border-slate-300 text-slate-500 dark:border-[#4a4a4e]"}`}>{availabilityLabel(item.availability)}</span></div></article>; })}</section>{visibleCount < filteredItems.length && <div className="mt-8 text-center"><Button variant="outline" size="lg" onClick={() => setVisibleCount((count) => count + 12)}>Load more equipment</Button></div>}</> : <div className="mt-5 border border-dashed border-slate-300 px-6 py-16 text-center dark:border-[#3a3a3e]"><h2 className="font-bold">No equipment matches these filters.</h2><p className="mt-2 text-sm text-slate-500 dark:text-[#96969d]">Try another search or clear the current filters.</p></div>}

    {selectedItem && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="save-item-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedItem(null); }}><div className="w-full max-w-md border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl dark:border-[#414146] dark:bg-[#1a1a1d] dark:text-white"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase text-[#f54449]">Add to quote list</p><h2 id="save-item-title" className="mt-1 text-lg font-bold">{selectedItem.title}</h2></div><Button variant="ghost" size="sm" className="size-9 px-0" onClick={() => setSelectedItem(null)} aria-label="Close"><X size={17} /></Button></div><div className="mt-5">{!userId ? <div className="border border-dashed border-slate-300 p-6 text-center dark:border-[#414146]"><p className="text-sm text-slate-500 dark:text-[#aaaab1]">Sign in to add equipment to a saved quote list.</p><Button asChild className="mt-4"><Link href="/login"><BookmarkPlus size={15} />Sign in</Link></Button></div> : !sets.length ? <div className="border border-dashed border-slate-300 p-6 text-center dark:border-[#414146]"><FolderHeart className="mx-auto text-[#77777f]" size={22} /><p className="mt-3 text-sm text-slate-500 dark:text-[#aaaab1]">Create a quote list before adding equipment.</p><Button asChild className="mt-4"><Link href="/account">Create a quote</Link></Button></div> : <div className="grid gap-2">{sets.map((set) => { const isSaved = savedSetIdsByItem[selectedItem.id]?.has(set.id) ?? false; const key = `${set.id}:${selectedItem.id}`; return <div key={set.id} className="flex items-center justify-between gap-3 border border-slate-200 px-4 py-3 dark:border-[#3a3a3e]"><span className="truncate text-sm font-medium">{set.title}</span>{isSaved ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"><Check size={14} />Added</span> : <Button size="sm" variant="outline" disabled={savingKey === key} onClick={() => saveToSet(set.id, selectedItem.id)}><Plus size={14} />{savingKey === key ? "Adding…" : "Add"}</Button>}</div>; })}</div>}</div></div></div>}
  </>;
}
