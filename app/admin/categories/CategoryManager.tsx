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
    const supabase = createClient();
    if (!supabase) return;
    setSaving(true); setError("");
    const { error: insertError } = await supabase.from("categories").insert({ name: categoryName });
    if (insertError) {
      setError(insertError.code === "23505" ? "That category already exists." : insertError.message);
      setSaving(false);
      return;
    }
    setName("");
    setSaving(false);
    router.refresh();
  }

  async function removeCategory(category: Category) {
    if (category.itemCount > 0 || !confirm("Delete the category “" + category.name + "”?")) return;
    const supabase = createClient();
    if (!supabase) return;
    const { error: deleteError } = await supabase.from("categories").delete().eq("id", category.id);
    if (deleteError) setError(deleteError.message);
    else router.refresh();
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setError("");
  }

  async function updateCategory(event: FormEvent, category: Category) {
    event.preventDefault();
    const categoryName = editName.trim();
    if (!categoryName || categoryName === category.name) {
      setEditingId(null);
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    setUpdating(true); setError("");
    const { error: updateError } = await supabase.from("categories").update({ name: categoryName }).eq("id", category.id);
    if (updateError) {
      setError(updateError.code === "23505" ? "That category already exists." : updateError.message);
      setUpdating(false);
      return;
    }
    setEditingId(null);
    setUpdating(false);
    router.refresh();
  }

  return <><form onSubmit={addCategory} className="mb-8 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row dark:border-slate-800 dark:bg-slate-900"><Input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="e.g. Camera, Lighting, Audio" aria-label="Category name" /><Button disabled={saving}><Plus size={15} />{saving ? "Adding…" : "Add category"}</Button>{error && <p className="self-center text-sm text-red-700 dark:text-red-300">{error}</p>}</form><section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="text-base font-semibold">All categories</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Categories are trimmed and compared without case, preventing accidental duplicates.</p></div>{initialCategories.length ? <div className="divide-y divide-slate-200 dark:divide-slate-800">{initialCategories.map((category) => <article key={category.id} className="flex items-center gap-3 px-5 py-4"><span className="grid size-9 place-items-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Tag size={16} /></span>{editingId === category.id ? <form className="flex min-w-0 flex-1 items-center gap-2" onSubmit={(event) => updateCategory(event, category)}><Input autoFocus value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={80} aria-label={"Edit " + category.name} /><Button size="sm" className="size-9 px-0" disabled={updating || !editName.trim()} aria-label="Save category"><Check size={15} /></Button><Button type="button" variant="ghost" size="sm" className="size-9 px-0" onClick={() => setEditingId(null)} aria-label="Cancel editing"><X size={15} /></Button></form> : <><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-medium">{category.name}</h3><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{category.itemCount} {category.itemCount === 1 ? "item" : "items"}</p></div><Button variant="ghost" size="sm" className="size-9 px-0" onClick={() => startEditing(category)} title="Edit category" aria-label={"Edit " + category.name}><Pencil size={15} /></Button><Button variant="ghost" size="sm" className="size-9 px-0 text-red-700 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-950/50 dark:hover:text-red-200" onClick={() => removeCategory(category)} disabled={category.itemCount > 0} title={category.itemCount > 0 ? "Remove or reassign items before deleting this category" : "Delete category"} aria-label={"Delete " + category.name}><Trash2 size={15} /></Button></>}</article>)}</div> : <div className="grid place-items-center px-5 py-14 text-center"><Tag size={22} className="mb-3 text-slate-400 dark:text-slate-500" /><p className="text-sm text-slate-500 dark:text-slate-400">No categories yet. Add one above before creating catalog items.</p></div>}</section></>;
}
