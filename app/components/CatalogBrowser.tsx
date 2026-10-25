"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookmarkPlus, Boxes, Check, CircleDot, FolderHeart, RotateCcw, Search, Tag, X } from "lucide-react";
import type { CatalogItem } from "../../lib/catalog";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { createClient } from "../../lib/supabase/client";

const availabilityLabels = { available: "Available", limited: "Limited availability", unavailable: "Currently unavailable" };
const availabilityClasses = { available: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300", limited: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300", unavailable: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300" };
const selectClass = "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:ring-slate-600";

type ProjectSet = { id: string; title: string };
const normalizeText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();

export default function CatalogBrowser({ items, userId, showSetTools = true }: { items: CatalogItem[]; userId?: string; showSetTools?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sets, setSets] = useState<ProjectSet[]>([]);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedSetIdsByItem, setSavedSetIdsByItem] = useState<Record<string, Set<string>>>({});
  const categories = Array.from(new Set(items.map((item) => item.category.trim()))).filter(Boolean).sort((a, b) => a.localeCompare(b));
  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    return items.filter((item) => {
      const searchableText = normalizeText(item.title + " " + item.category);
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      return matchesQuery && (category === "all" || item.category.trim() === category) && (availability === "all" || item.availability === availability);
    });
  }, [availability, category, items, query]);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    if (!supabase) return;
    supabase.from("project_sets").select("id,title").order("created_at", { ascending: false }).then(async ({ data }) => {
      const projectSets = (data ?? []) as ProjectSet[];
      setSets(projectSets);
      if (!projectSets.length) return;

      const { data: savedItems } = await supabase
        .from("project_set_items")
        .select("project_set_id,catalog_item_id")
        .in("project_set_id", projectSets.map((set) => set.id));

      const savedSets: Record<string, Set<string>> = {};
      for (const row of savedItems ?? []) {
        if (!savedSets[row.catalog_item_id]) savedSets[row.catalog_item_id] = new Set();
        savedSets[row.catalog_item_id].add(row.project_set_id);
      }
      setSavedSetIdsByItem(savedSets);
    });
  }, [userId]);

  async function saveToSet(projectSetId: string, catalogItemId: string) {
    const supabase = createClient();
    if (!supabase) return;
    const key = projectSetId + ":" + catalogItemId;
    setSavingKey(key);
    const { error } = await supabase.from("project_set_items").upsert({ project_set_id: projectSetId, catalog_item_id: catalogItemId, quantity: 1 }, { onConflict: "project_set_id,catalog_item_id" });
    if (!error) {
      setSavedSetIdsByItem((current) => ({
        ...current,
        [catalogItemId]: new Set(current[catalogItemId] ?? []).add(projectSetId),
      }));
    }
    setSavingKey(null);
  }

  return (
    <>
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[2fr_1fr_1fr] dark:border-slate-800 dark:bg-slate-900" aria-label="Filter catalog">
        <label className="grid gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"><span className="flex items-center gap-1.5"><Search size={14} className="text-slate-400 dark:text-slate-500" />Search</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search equipment" /></label>
        <label className="grid gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"><span className="flex items-center gap-1.5"><Tag size={14} className="text-slate-400 dark:text-slate-500" />Category</span><select className={selectClass} value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <label className="grid gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"><span className="flex items-center gap-1.5"><CircleDot size={14} className="text-slate-400 dark:text-slate-500" />Availability</span><select className={selectClass} value={availability} onChange={(event) => setAvailability(event.target.value)}><option value="all">Any status</option><option value="available">Available</option><option value="limited">Limited availability</option><option value="unavailable">Currently unavailable</option></select></label>
      </section>

      <div className="flex items-center justify-between py-6">
        <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400"><Boxes size={15} />{filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}</p>
        {(query || category !== "all" || availability !== "all") && <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setCategory("all"); setAvailability("all"); }}><RotateCcw size={14} />Clear</Button>}
      </div>

      {filteredItems.length ? <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredItems.map((item) => (
        <Card className="overflow-hidden transition-shadow hover:shadow-md" key={item.id}>
          <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800">{item.featured_media || item.media?.[0] ? <img src={item.featured_media || item.media[0]} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">No image yet</span>}</div>
          <CardContent className="p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.category}</p>
            <h2 className="mb-3 line-clamp-2 text-base font-semibold tracking-tight text-slate-950 dark:text-slate-50">{item.title}</h2>
            <div className="flex items-center justify-between gap-3">
              <Badge variant="secondary" className={availabilityClasses[item.availability]}>{availabilityLabels[item.availability]}</Badge>
              {showSetTools && item.availability === "available" && <Button variant="outline" size="sm" className="h-8 w-8 shrink-0 p-0" onClick={() => setSelectedItem(item)} aria-label="Save to a set" title="Save to a set"><BookmarkPlus size={15} /></Button>}
            </div>
          </CardContent>
        </Card>
      ))}</section> : <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-16 text-center dark:border-slate-700 dark:bg-slate-900"><Boxes className="mx-auto mb-3 text-slate-400 dark:text-slate-500" size={22} /><h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">No items match those filters.</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a broader search or clear the filters.</p></div>}

      {selectedItem && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="save-item-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedItem(null); }}>
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Save equipment</p><h2 id="save-item-title" className="mt-1 truncate text-base font-semibold text-slate-950 dark:text-slate-50">{selectedItem.title}</h2></div>
            <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" onClick={() => setSelectedItem(null)} aria-label="Close"><X size={16} /></Button>
          </div>

          <div className="mt-4">
            {!userId ? <div className="rounded-md border border-dashed border-slate-200 p-5 text-center dark:border-slate-700"><p className="text-sm text-slate-600 dark:text-slate-300">Sign in to save equipment to a project set.</p><Button asChild className="mt-4" size="sm"><Link href="/login">Sign in</Link></Button></div> : !sets.length ? <div className="rounded-md border border-dashed border-slate-200 p-5 text-center dark:border-slate-700"><FolderHeart className="mx-auto text-slate-400 dark:text-slate-500" size={20} /><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Create a project set before saving equipment.</p><Button asChild className="mt-4" size="sm"><Link href="/account">Create a set</Link></Button></div> : <div className="grid gap-2">{sets.map((set) => {
              const isSaved = savedSetIdsByItem[selectedItem.id]?.has(set.id) ?? false;
              const key = set.id + ":" + selectedItem.id;
              return <div key={set.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2.5 dark:border-slate-700"><span className="min-w-0 truncate text-sm font-medium text-slate-800 dark:text-slate-100">{set.title}</span>{isSaved ? <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-300"><Check size={14} />Saved</span> : <Button size="sm" variant="outline" disabled={savingKey === key} onClick={() => saveToSet(set.id, selectedItem.id)}><BookmarkPlus size={14} />{savingKey === key ? "Saving…" : "Add"}</Button>}</div>;
            })}</div>}
          </div>
        </div>
      </div>}
    </>
  );
}
