"use client";

import Link from "next/link";
import { Check, FolderHeart, Info, Plus, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import type { CatalogItem } from "../../lib/catalog";
import { createClient } from "../../lib/supabase/client";
import { Button } from "../../components/ui/button";

type ProjectSet = { id: string; title: string };

export default function HomeEquipmentCard({ item, userId, allowQuote = true }: { item: CatalogItem; userId?: string; allowQuote?: boolean }) {
  const image = item.featured_media || item.media?.[0];
  const [open, setOpen] = useState(false);
  const [sets, setSets] = useState<ProjectSet[] | null>(null);
  const [savedSetIds, setSavedSetIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState("");

  async function openQuotePicker() {
    setOpen(true);
    if (!userId || sets !== null) return;
    const supabase = createClient(); if (!supabase) return;
    const { data } = await supabase.from("project_sets").select("id,title").order("created_at", { ascending: false });
    const projectSets = (data ?? []) as ProjectSet[];
    setSets(projectSets);
    if (!projectSets.length) return;
    const { data: saved } = await supabase.from("project_set_items").select("project_set_id").eq("catalog_item_id", item.id).in("project_set_id", projectSets.map((set) => set.id));
    setSavedSetIds(new Set((saved ?? []).map((row) => row.project_set_id)));
  }

  async function addToSet(setId: string) {
    const supabase = createClient(); if (!supabase) return;
    setBusy(setId);
    const { error } = await supabase.from("project_set_items").upsert({ project_set_id: setId, catalog_item_id: item.id, quantity: 1 }, { onConflict: "project_set_id,catalog_item_id" });
    if (!error) setSavedSetIds((current) => new Set(current).add(setId));
    setBusy("");
  }

  return <>
    <article className="group border border-slate-200 bg-white p-3 transition hover:border-[#f54449] dark:border-[#343438] dark:bg-[#1a1a1d]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f5f5]">
        {image ? <img src={image} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <span className="grid h-full place-items-center text-sm text-slate-400">No image</span>}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/55 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <Link href={`/catalog/${item.id}`} aria-label={`View details for ${item.title}`} title="View details" className="grid size-11 place-items-center border border-white/50 bg-[#171719]/90 text-white transition hover:border-[#f54449] hover:bg-[#f54449]"><Info size={19} /></Link>
          {allowQuote && item.availability !== "unavailable" && <button onClick={openQuotePicker} aria-label={`Add ${item.title} to a quote list`} title="Add to quote list" className="grid size-11 place-items-center border border-white/50 bg-[#171719]/90 text-white transition hover:border-[#f54449] hover:bg-[#f54449]"><ShoppingCart size={19} /></button>}
        </div>
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase text-[#f54449]">{item.category}</p>
      <Link href={`/catalog/${item.id}`} className="mt-1 block line-clamp-2 font-bold hover:text-[#f54449]">{item.title}</Link>
      <p className="mt-2 text-xs text-slate-500 dark:text-[#96969d]">{item.availability === "available" ? "Available" : "Check availability"}</p>
    </article>

    {open && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="w-full max-w-md border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl dark:border-[#414146] dark:bg-[#1a1a1d] dark:text-white">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase text-[#f54449]">Add to quote list</p><h2 className="mt-1 text-lg font-bold">{item.title}</h2></div><button onClick={() => setOpen(false)} className="grid size-9 place-items-center" aria-label="Close"><X size={18} /></button></div>
        {!userId ? <div className="mt-5 border border-dashed border-slate-300 p-6 text-center dark:border-[#414146]"><p className="text-sm text-slate-500 dark:text-[#aaaab1]">Sign in to add equipment to a quote list.</p><Button asChild className="mt-4"><Link href="/login">Sign in</Link></Button></div> : sets === null ? <p className="mt-6 text-sm text-slate-500">Loading your quote lists…</p> : sets.length === 0 ? <div className="mt-5 border border-dashed border-slate-300 p-6 text-center dark:border-[#414146]"><FolderHeart className="mx-auto text-slate-400" size={22} /><p className="mt-3 text-sm text-slate-500">Create a quote list before adding equipment.</p><Button asChild className="mt-4"><Link href="/account">Create a quote</Link></Button></div> : <div className="mt-5 grid gap-2">{sets.map((set) => <div key={set.id} className="flex items-center justify-between gap-3 border border-slate-200 px-4 py-3 dark:border-[#3a3a3e]"><span className="truncate text-sm font-medium">{set.title}</span>{savedSetIds.has(set.id) ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"><Check size={14} />Added</span> : <Button size="sm" variant="outline" disabled={busy === set.id} onClick={() => addToSet(set.id)}><Plus size={14} />{busy === set.id ? "Adding…" : "Add"}</Button>}</div>)}</div>}
      </div>
    </div>}
  </>;
}
