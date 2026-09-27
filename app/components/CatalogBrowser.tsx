"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookmarkPlus, Boxes, CircleDot, RotateCcw, Search, Tag } from "lucide-react";
import type { CatalogItem } from "../../lib/catalog";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { createClient } from "../../lib/supabase/client";

const availabilityLabels = { available: "Available", limited: "Limited availability", unavailable: "Currently unavailable" };
const availabilityClasses = { available: "border-green-200 bg-green-50 text-green-700", limited: "border-amber-200 bg-amber-50 text-amber-700", unavailable: "border-red-200 bg-red-50 text-red-700" };
const selectClass = "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:ring-2 focus:ring-slate-400";

type ProjectSet = { id: string; title: string };

export default function CatalogBrowser({ items, userId }: { items: CatalogItem[]; userId?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sets, setSets] = useState<ProjectSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const categories = Array.from(new Set(items.map((item) => item.category))).filter(Boolean);
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery = !normalizedQuery || (item.title + " " + item.description + " " + item.category).toLowerCase().includes(normalizedQuery);
      return matchesQuery && (category === "all" || item.category === category) && (availability === "all" || item.availability === availability);
    });
  }, [availability, category, items, query]);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    if (!supabase) return;
    supabase.from("project_sets").select("id,title").order("created_at", { ascending: false }).then(({ data }) => {
      const projectSets = (data ?? []) as ProjectSet[];
      setSets(projectSets);
      setSelectedSetId(projectSets[0]?.id ?? "");
    });
  }, [userId]);

  async function saveToSet(catalogItemId: string) {
    const supabase = createClient();
    if (!supabase || !selectedSetId) return;
    setSavingItemId(catalogItemId); setSavedItemId(null);
    const { error } = await supabase.from("project_set_items").upsert({ project_set_id: selectedSetId, catalog_item_id: catalogItemId, quantity: 1 }, { onConflict: "project_set_id,catalog_item_id" });
    if (!error) setSavedItemId(catalogItemId);
    setSavingItemId(null);
  }

  return (
    <>
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[2fr_1fr_1fr]" aria-label="Filter catalog">
        <label className="grid gap-2 text-xs font-medium text-slate-700"><span className="flex items-center gap-1.5"><Search size={14} className="text-slate-400" />Search</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search equipment" /></label>
        <label className="grid gap-2 text-xs font-medium text-slate-700"><span className="flex items-center gap-1.5"><Tag size={14} className="text-slate-400" />Category</span><select className={selectClass} value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <label className="grid gap-2 text-xs font-medium text-slate-700"><span className="flex items-center gap-1.5"><CircleDot size={14} className="text-slate-400" />Availability</span><select className={selectClass} value={availability} onChange={(event) => setAvailability(event.target.value)}><option value="all">Any status</option><option value="available">Available</option><option value="limited">Limited availability</option><option value="unavailable">Currently unavailable</option></select></label>
      </section>

      <div className="flex items-center justify-between py-6">
        <p className="flex items-center gap-1.5 text-sm text-slate-500"><Boxes size={15} />{filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}</p>
        {(query || category !== "all" || availability !== "all") && <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setCategory("all"); setAvailability("all"); }}><RotateCcw size={14} />Clear</Button>}
      </div>

      {filteredItems.length ? <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredItems.map((item) => (
        <Card className="overflow-hidden transition-shadow hover:shadow-md" key={item.id}>
          <div className="aspect-[4/3] bg-slate-100">{item.featured_media || item.media?.[0] ? <img src={item.featured_media || item.media[0]} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-sm text-slate-400">No image yet</span>}</div>
          <CardContent className="p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{item.category}</p>
            <h2 className="mb-3 text-base font-semibold tracking-tight text-slate-950">{item.title}</h2>
            <Badge variant="secondary" className={availabilityClasses[item.availability]}>{availabilityLabels[item.availability]}</Badge>
            {item.availability === "available" && <div className="mt-4">{!userId ? <Button asChild variant="outline" size="sm"><Link href="/register"><BookmarkPlus size={14} />Save to set</Link></Button> : !sets.length ? <Button asChild variant="outline" size="sm"><Link href="/account"><BookmarkPlus size={14} />Create a set</Link></Button> : <div className="flex gap-2"><select aria-label="Choose a project set" className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-slate-400" value={selectedSetId} onChange={(event) => setSelectedSetId(event.target.value)}>{sets.map((set) => <option key={set.id} value={set.id}>{set.title}</option>)}</select><Button size="sm" onClick={() => saveToSet(item.id)} disabled={savingItemId === item.id}>{savedItemId === item.id ? "Saved" : <><BookmarkPlus size={14} />Save</>}</Button></div>}</div>}
          </CardContent>
        </Card>
      ))}</section> : <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-16 text-center"><Boxes className="mx-auto mb-3 text-slate-400" size={22} /><h2 className="text-sm font-semibold text-slate-950">No items match those filters.</h2><p className="mt-1 text-sm text-slate-500">Try a broader search or clear the filters.</p></div>}
    </>
  );
}
