"use client";

import { FormEvent, useState } from "react";
import { Check, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { createClient } from "../../../lib/supabase/client";

export type Category = { id: string; name: string; itemCount: number };

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [updating, setUpdating] = useState(false);

  async function addCategory(event: FormEvent) {
    event.preventDefault();
    const categoryName = name.trim();
    if (!categoryName) return;
    const supabase = createClient(); if (!supabase) return;
    setSaving(true); setError("");
    const { error: insertError } = await supabase.from("categories").insert({ name: categoryName });
    if (insertError) { setError(insertError.code === "23505" ? "That category already exists." : insertError.message); setSaving(false); return; }
    setName(""); setSaving(false); router.refresh();
  }

  async function removeCategory(category: Category) {
    if (category.itemCount > 0 || !confirm(`Delete the category “${category.name}”?`)) return;
    const supabase = createClient(); if (!supabase) return;
    const { error: deleteError } = await supabase.from("categories").delete().eq("id", category.id);
    if (deleteError) setError(deleteError.message); else router.refresh();
  }

  function startEditing(category: Category) { setEditingId(category.id); setEditName(category.name); setError(""); }

  async function updateCategory(event: FormEvent, category: Category) {
    event.preventDefault();
    const categoryName = editName.trim();
    if (!categoryName || categoryName === category.name) { setEditingId(null); return; }
    const supabase = createClient(); if (!supabase) return;
    setUpdating(true); setError("");
    const { error: updateError } = await supabase.from("categories").update({ name: categoryName }).eq("id", category.id);
    if (updateError) { setError(updateError.code === "23505" ? "That category already exists." : updateError.message); setUpdating(false); return; }
    setEditingId(null); setUpdating(false); router.refresh();
  }

  return <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
    <aside className="h-fit border border-slate-200 bg-white p-6 dark:border-[#343438] dark:bg-[#1a1a1d]">
      <p className="text-xs font-bold uppercase text-[#f54449]">New category</p>
      <h2 className="mt-2 text-xl font-black">Add an option</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-[#929299]">Categories keep equipment forms and public filters consistent.</p>
      <form onSubmit={addCategory} className="mt-6 grid gap-3"><label className="grid gap-2 text-xs font-bold uppercase text-slate-600 dark:text-[#b4b4ba]">Category name<Input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="e.g. Camera" /></label><Button disabled={saving} className="w-full"><Plus size={15} />{saving ? "Adding…" : "Add category"}</Button></form>
      {error && <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      <div className="mt-6 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500 dark:border-[#343438] dark:text-[#85858c]">A category can only be deleted after all equipment has been reassigned.</div>
    </aside>

    <section className="border border-slate-200 bg-white dark:border-[#343438] dark:bg-[#1a1a1d]">
      <div className="flex items-end justify-between border-b border-slate-200 p-5 dark:border-[#343438]"><div><p className="text-xs font-bold uppercase text-[#f54449]">Approved taxonomy</p><h2 className="mt-1 text-xl font-black">All categories</h2></div><span className="text-3xl font-black text-slate-300 dark:text-[#424247]">{String(initialCategories.length).padStart(2, "0")}</span></div>
      {initialCategories.length ? <div>{initialCategories.map((category, index) => <article key={category.id} className="grid grid-cols-[42px_1fr_auto] items-center gap-4 border-b border-slate-200 p-4 last:border-b-0 dark:border-[#303034]"><span className="grid size-10 place-items-center bg-slate-100 text-slate-500 dark:bg-[#27272b] dark:text-[#9a9aa1]"><Tag size={16} /></span>{editingId === category.id ? <form className="flex min-w-0 items-center gap-2" onSubmit={(event) => updateCategory(event, category)}><Input autoFocus value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={80} /><Button size="sm" className="size-9 px-0" disabled={updating || !editName.trim()} aria-label="Save category"><Check size={15} /></Button><Button type="button" variant="ghost" size="sm" className="size-9 px-0" onClick={() => setEditingId(null)} aria-label="Cancel editing"><X size={15} /></Button></form> : <div className="min-w-0"><p className="text-[10px] font-bold uppercase text-slate-400 dark:text-[#696970]">Category {String(index + 1).padStart(2, "0")}</p><h3 className="mt-1 truncate font-bold">{category.name}</h3><p className="mt-1 text-xs text-slate-500 dark:text-[#8f8f96]">{category.itemCount} {category.itemCount === 1 ? "equipment item" : "equipment items"}</p></div>}{editingId !== category.id && <div className="flex"><Button variant="ghost" size="sm" className="size-9 px-0" onClick={() => startEditing(category)} aria-label={`Edit ${category.name}`}><Pencil size={15} /></Button><Button variant="ghost" size="sm" className="size-9 px-0 text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/50" onClick={() => removeCategory(category)} disabled={category.itemCount > 0} title={category.itemCount > 0 ? "Reassign equipment before deleting" : "Delete category"} aria-label={`Delete ${category.name}`}><Trash2 size={15} /></Button></div>}</article>)}</div> : <div className="grid place-items-center px-5 py-16 text-center"><Tag size={24} className="text-slate-400 dark:text-[#77777f]" /><p className="mt-4 text-sm text-slate-500 dark:text-[#929299]">No categories yet.</p></div>}
    </section>
  </div>;
}
