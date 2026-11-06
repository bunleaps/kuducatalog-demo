"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, FolderHeart, Heart, Plus, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { createClient } from "../../../lib/supabase/client";

type ProjectSet = { id: string; title: string };

export default function EquipmentDetailActions({ itemId, userId, availability }: { itemId: string; userId?: string; availability: string }) {
  const [favorite, setFavorite] = useState(false);
  const [sets, setSets] = useState<ProjectSet[]>([]);
  const [savedSetIds, setSavedSetIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient(); if (!supabase) return;
    Promise.all([
      supabase.from("favorites").select("catalog_item_id").eq("catalog_item_id", itemId).maybeSingle(),
      supabase.from("project_sets").select("id,title").order("created_at", { ascending: false }),
    ]).then(async ([favoriteResult, setsResult]) => {
      setFavorite(Boolean(favoriteResult.data));
      const nextSets = (setsResult.data ?? []) as ProjectSet[];
      setSets(nextSets);
      if (!nextSets.length) return;
      const { data } = await supabase.from("project_set_items").select("project_set_id").eq("catalog_item_id", itemId).in("project_set_id", nextSets.map((set) => set.id));
      setSavedSetIds(new Set((data ?? []).map((row) => row.project_set_id)));
    });
  }, [itemId, userId]);

  async function toggleFavorite() {
    if (!userId) return;
    const supabase = createClient(); if (!supabase) return;
    setBusy("favorite");
    const { error } = favorite ? await supabase.from("favorites").delete().eq("catalog_item_id", itemId) : await supabase.from("favorites").insert({ user_id: userId, catalog_item_id: itemId });
    if (!error) setFavorite((value) => !value);
    setBusy("");
  }

  async function addToSet(setId: string) {
    const supabase = createClient(); if (!supabase) return;
    setBusy(setId);
    const { error } = await supabase.from("project_set_items").upsert({ project_set_id: setId, catalog_item_id: itemId, quantity: 1 }, { onConflict: "project_set_id,catalog_item_id" });
    if (!error) setSavedSetIds((current) => new Set(current).add(setId));
    setBusy("");
  }

  if (!userId) return <div className="grid gap-3 sm:grid-cols-2"><Button asChild size="lg"><Link href="/login"><Plus size={16} />Sign in to add to quote</Link></Button><Button asChild variant="outline" size="lg"><Link href="/login"><Heart size={16} />Save favorite</Link></Button></div>;

  return <><div className="grid gap-3 sm:grid-cols-2"><Button size="lg" disabled={availability === "unavailable"} onClick={() => setOpen(true)}><Plus size={16} />{availability === "unavailable" ? "Currently unavailable" : "Add to quote"}</Button><Button variant="outline" size="lg" disabled={busy === "favorite"} onClick={toggleFavorite}><Heart size={16} fill={favorite ? "currentColor" : "none"} />{favorite ? "Saved to favorites" : "Save favorite"}</Button></div>{open && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><div className="w-full max-w-md border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl dark:border-[#414146] dark:bg-[#1a1a1d] dark:text-white"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Choose a quote list</h2><button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div>{sets.length ? <div className="mt-5 grid gap-2">{sets.map((set) => <div key={set.id} className="flex items-center justify-between border border-slate-200 px-4 py-3 dark:border-[#3a3a3e]"><span className="truncate text-sm font-medium">{set.title}</span>{savedSetIds.has(set.id) ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"><Check size={14} />Added</span> : <Button size="sm" variant="outline" disabled={busy === set.id} onClick={() => addToSet(set.id)}><Plus size={14} />{busy === set.id ? "Adding…" : "Add"}</Button>}</div>)}</div> : <div className="mt-5 border border-dashed border-slate-300 p-7 text-center dark:border-[#414146]"><FolderHeart className="mx-auto text-slate-400" size={22} /><p className="mt-3 text-sm text-slate-500">Create a quote list before adding equipment.</p><Button asChild className="mt-4"><Link href="/account">Create a quote</Link></Button></div>}</div></div>}</>;
}
