"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookmarkPlus, Check, FolderHeart, Plus, RotateCcw, Search, X } from "lucide-react";
import type { CatalogItem } from "../../lib/catalog";
import { Button } from "../../components/ui/button";
import { createClient } from "../../lib/supabase/client";

type ProjectSet = { id: string; title: string };
const normalizeText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();

export default function CatalogBrowser({ items, userId, showSetTools = true, initialQuery = "", initialCategory = "all" }: { items: CatalogItem[]; userId?: string; showSetTools?: boolean; initialQuery?: string; initialCategory?: string }) {
  const categories = Array.from(new Set(items.map((item) => item.category.trim()))).filter(Boolean).sort((a, b) => a.localeCompare(b));
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : "all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [sets, setSets] = useState<ProjectSet[]>([]);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedSetIdsByItem, setSavedSetIdsByItem] = useState<Record<string, Set<string>>>({});

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    const result = items.filter((item) => (!normalizedQuery || normalizeText(`${item.title} ${item.category}`).includes(normalizedQuery)) && (category === "all" || item.category.trim() === category) && (!availableOnly || item.availability === "available"));
    return sort === "name" ? [...result].sort((a, b) => a.title.localeCompare(b.title)) : result;
  }, [availableOnly, category, items, query, sort]);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient(); if (!supabase) return;
    supabase.from("project_sets").select("id,title").order("created_at", { ascending: false }).then(async ({ data }) => {
      const projectSets = (data ?? []) as ProjectSet[]; setSets(projectSets); if (!projectSets.length) return;
      const { data: savedItems } = await supabase.from("project_set_items").select("project_set_id,catalog_item_id").in("project_set_id", projectSets.map((set) => set.id));
      const savedSets: Record<string, Set<string>> = {};
      for (const row of savedItems ?? []) { if (!savedSets[row.catalog_item_id]) savedSets[row.catalog_item_id] = new Set(); savedSets[row.catalog_item_id].add(row.project_set_id); }
      setSavedSetIdsByItem(savedSets);
    });
  }, [userId]);

  async function saveToSet(projectSetId: string, catalogItemId: string) {
    const supabase = createClient(); if (!supabase) return;
    const key = `${projectSetId}:${catalogItemId}`; setSavingKey(key);
    const { error } = await supabase.from("project_set_items").upsert({ project_set_id: projectSetId, catalog_item_id: catalogItemId, quantity: 1 }, { onConflict: "project_set_id,catalog_item_id" });
    if (!error) setSavedSetIdsByItem((current) => ({ ...current, [catalogItemId]: new Set(current[catalogItemId] ?? []).add(projectSetId) }));
    setSavingKey(null);
  }

  const clear = () => { setQuery(""); setCategory("all"); setAvailableOnly(false); };

  return <>
    <div className="mt-7 grid overflow-hidden border border-slate-200 bg-white dark:border-transparent sm:grid-cols-[1fr_220px_130px]"><label className="flex h-14 items-center gap-3 px-5"><Search size={17} className="text-slate-400" /><input className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-500" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cameras, lenses, lighting, grip…" /></label><select className="h-14 border-y border-slate-200 bg-white px-5 text-xs font-bold uppercase text-slate-900 outline-none sm:border-x sm:border-y-0" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((option) => <option key={option}>{option}</option>)}</select><button className="h-14 bg-[#f54449] text-xs font-bold uppercase text-white hover:bg-[#ff565b]">Search</button></div>

    <div className="mt-7 grid gap-7 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit border border-slate-200 bg-white p-4 dark:border-[#343438] dark:bg-[#1a1a1d]"><h2 className="px-2 text-base font-bold">Categories</h2><div className="mt-4 grid gap-1">{["all", ...categories].map((option) => <button key={option} onClick={() => setCategory(option)} className={`px-4 py-3 text-left text-sm transition ${category === option ? "bg-[#f54449] font-bold text-white" : "text-slate-600 hover:bg-slate-100 dark:text-[#d0d0d5] dark:hover:bg-[#242427]"}`}>{option === "all" ? "All equipment" : option}</button>)}</div><div className="my-5 border-t border-slate-200 dark:border-[#343438]" /><p className="px-2 text-xs uppercase text-slate-500 dark:text-[#85858c]">Availability</p><label className="mt-4 flex cursor-pointer items-center gap-2 px-2 text-sm"><input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} className="accent-[#f54449]" />Available now</label>{(query || category !== "all" || availableOnly) && <button onClick={clear} className="mt-5 flex items-center gap-2 px-2 text-xs font-bold uppercase text-[#f54449]"><RotateCcw size={13} />Clear filters</button>}</aside>

      <div><div className="mb-5 flex items-center justify-between text-sm text-slate-500 dark:text-[#9b9ba2]"><span>{filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}</span><label className="flex items-center gap-2">Sort:<select className="bg-transparent text-slate-950 outline-none dark:text-white" value={sort} onChange={(event) => setSort(event.target.value)}><option className="bg-white dark:bg-[#1a1a1d]" value="featured">Featured</option><option className="bg-white dark:bg-[#1a1a1d]" value="name">Name</option></select></label></div>
        {filteredItems.length ? <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredItems.map((item) => { const image = item.featured_media || item.media?.[0]; return <article key={item.id} className="group border border-slate-200 bg-white p-3 transition hover:border-[#f54449] dark:border-[#343438] dark:bg-[#1a1a1d]"><div className="aspect-[4/3] overflow-hidden bg-[#f5f5f5]">{image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" /> : <span className="grid h-full place-items-center text-sm text-slate-400">No image</span>}</div><p className="mt-4 text-[11px] font-bold uppercase text-[#f54449]">{item.category}</p><h2 className="mt-1 line-clamp-2 text-base font-bold">{item.title}</h2><div className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-[#98989f]"><span>{item.availability === "available" ? "Available" : item.availability === "limited" ? "Limited availability" : "Unavailable"}</span>{showSetTools && item.availability === "available" && <button onClick={() => setSelectedItem(item)} className="flex items-center gap-1 font-medium text-slate-600 hover:text-slate-950 dark:text-[#bdbdc3] dark:hover:text-white"><Plus size={14} />Add to quote</button>}</div></article>; })}</section> : <div className="border border-dashed border-slate-300 px-6 py-16 text-center dark:border-[#3a3a3e]"><h2 className="font-bold">No equipment matches these filters.</h2><p className="mt-2 text-sm text-slate-500 dark:text-[#96969d]">Try another search or clear the current filters.</p></div>}
      </div>
    </div>

    {selectedItem && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="save-item-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedItem(null); }}><div className="w-full max-w-md border border-[#414146] bg-[#1a1a1d] p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase text-[#f54449]">Add to quote list</p><h2 id="save-item-title" className="mt-1 text-lg font-bold">{selectedItem.title}</h2></div><Button variant="ghost" size="sm" className="size-9 px-0" onClick={() => setSelectedItem(null)} aria-label="Close"><X size={17} /></Button></div><div className="mt-5">{!userId ? <div className="border border-dashed border-[#414146] p-6 text-center"><p className="text-sm text-[#aaaab1]">Sign in to add equipment to a saved quote list.</p><Button asChild className="mt-4"><Link href="/login"><BookmarkPlus size={15} />Sign in</Link></Button></div> : !sets.length ? <div className="border border-dashed border-[#414146] p-6 text-center"><FolderHeart className="mx-auto text-[#77777f]" size={22} /><p className="mt-3 text-sm text-[#aaaab1]">Create a quote list before adding equipment.</p><Button asChild className="mt-4"><Link href="/account">Create a quote</Link></Button></div> : <div className="grid gap-2">{sets.map((set) => { const isSaved = savedSetIdsByItem[selectedItem.id]?.has(set.id) ?? false; const key = `${set.id}:${selectedItem.id}`; return <div key={set.id} className="flex items-center justify-between gap-3 border border-[#3a3a3e] px-4 py-3"><span className="truncate text-sm font-medium">{set.title}</span>{isSaved ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><Check size={14} />Added</span> : <Button size="sm" variant="outline" disabled={savingKey === key} onClick={() => saveToSet(set.id, selectedItem.id)}><Plus size={14} />{savingKey === key ? "Adding…" : "Add"}</Button>}</div>; })}</div>}</div></div></div>}
  </>;
}
