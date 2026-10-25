"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Folder, ImagePlus, Star, Tag, Trash2, Type } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { createClient } from "../../lib/supabase/client";
import { storageBucket } from "../../lib/supabase/config";
import AdminTabs from "./AdminTabs";

type Item = { id?: string; title: string; category: string; category_id?: string | null; description: string; availability: string; media: string[]; featured_media: string | null; is_published: boolean };
type CategoryOption = { id: string; name: string };
const blankItem: Item = { title: "", category: "", category_id: "", description: "", availability: "available", is_published: true, media: [], featured_media: null };
const selectClass = "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:ring-2 focus:ring-slate-400";
const labelClass = "grid gap-2 text-sm font-medium text-slate-700";

export default function AdminItemForm({ initialItem, categories }: { initialItem?: Item; categories: CategoryOption[] }) {
  const router = useRouter();
  const initialCategory = categories.find((category) => category.id === initialItem?.category_id) ?? categories.find((category) => category.name.trim().toLowerCase() === initialItem?.category?.trim().toLowerCase()) ?? categories[0];
  const [form, setForm] = useState<Item>(initialItem ? { ...initialItem, category_id: initialCategory?.id ?? "", category: initialCategory?.name ?? initialItem.category } : { ...blankItem, category_id: initialCategory?.id ?? "", category: initialCategory?.name ?? "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [removedMedia, setRemovedMedia] = useState<string[]>([]);
  const supabase = createClient();
  const editing = Boolean(initialItem?.id);
  async function upload(files: FileList | null) {
    if (!supabase || !files?.length) return;
    try {
      const urls = await Promise.all(Array.from(files).map(async (file) => {
        const path = crypto.randomUUID() + "-" + file.name.replace(/[^a-z0-9.]/gi, "-");
        const { error } = await supabase.storage.from(storageBucket).upload(path, file);
        if (error) throw error;
        return supabase.storage.from(storageBucket).getPublicUrl(path).data.publicUrl;
      }));
      setForm((current) => ({ ...current, media: [...current.media, ...urls], featured_media: current.featured_media ?? urls[0] ?? null }));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to upload image."); }
  }
  function removeMedia(url: string) {
    setForm((current) => {
      const media = current.media.filter((item) => item !== url);
      return { ...current, media, featured_media: current.featured_media === url ? media[0] ?? null : current.featured_media };
    });
    setRemovedMedia((current) => current.includes(url) ? current : [...current, url]);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!supabase) { setMessage("Supabase is not configured."); return; }
    setSaving(true); setMessage("");
    const payload = { title: form.title, category: form.category, category_id: form.category_id, description: form.description, availability: form.availability, media: form.media, featured_media: form.featured_media, is_published: form.is_published };
    const result = editing ? await supabase.from("catalog_items").update(payload).eq("id", form.id).select().single() : await supabase.from("catalog_items").insert(payload).select().single();
    if (result.error) { setMessage(result.error.message); setSaving(false); return; }
    const publicUrlMarker = "/storage/v1/object/public/" + storageBucket + "/";
    const removedPaths = removedMedia.map((url) => {
      const markerIndex = url.indexOf(publicUrlMarker);
      return markerIndex >= 0 ? decodeURIComponent(url.slice(markerIndex + publicUrlMarker.length)) : null;
    }).filter((path): path is string => Boolean(path));
    if (removedPaths.length) await supabase.storage.from(storageBucket).remove(removedPaths);
    router.push("/admin"); router.refresh();
  }

  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6"><Link href="/admin" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white">R</span>RENT4SET <span className="font-normal text-slate-400">/ Admin</span></Link><Button asChild variant="ghost" size="sm"><Link href="/admin"><ArrowLeft size={15} />Back to catalog</Link></Button></div></header>
    <AdminTabs active="catalog" />
    <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10"><div className="mb-7"><p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{editing ? "Edit item" : "New item"}</p><h1 className="text-3xl font-semibold tracking-tight">{editing ? "Edit item" : "Add an item"}</h1><p className="mt-2 text-sm text-slate-500">Add the details, availability, and media for this equipment.</p></div>
      <form className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={save}>
        <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr_1fr]"><label className={labelClass}><span className="flex items-center gap-1.5"><Type size={14} className="text-slate-400" />Title</span><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Sony FX3" /></label><label className={labelClass}><span className="flex items-center gap-1.5"><Tag size={14} className="text-slate-400" />Category</span><select required disabled={!categories.length} className={selectClass} value={form.category_id ?? ""} onChange={(e) => { const category = categories.find((option) => option.id === e.target.value); setForm({ ...form, category_id: category?.id ?? "", category: category?.name ?? "" }); }}>{!categories.length && <option value="">Create a category first</option>}{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><Link href="/admin/categories" className="text-xs font-normal text-slate-500 underline-offset-4 hover:text-slate-950 hover:underline">Manage categories</Link></label><label className={labelClass}><span className="flex items-center gap-1.5"><Folder size={14} className="text-slate-400" />Availability</span><select className={selectClass} value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}><option value="available">Available</option><option value="limited">Limited availability</option><option value="unavailable">Currently unavailable</option></select></label></div>
        <label className={labelClass}><span className="flex items-center gap-1.5"><FileText size={14} className="text-slate-400" />Description <span className="font-normal text-slate-400">Markdown supported</span></span><Textarea required rows={10} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={"Add specs, notes, or kit details…\n\n**Example:** Includes two batteries and a cage."} /></label>
        <label className={labelClass}><span className="flex items-center gap-1.5"><ImagePlus size={14} className="text-slate-400" />Media <span className="font-normal text-slate-400">Images are public</span></span><Input type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)} /></label>
        {form.media.length > 0 && <div><p className="mb-2 text-sm font-medium text-slate-700">Featured image</p><p className="mb-3 text-xs text-slate-500">Click an image to feature it, or use the trash button to remove it.</p><div className="flex flex-wrap gap-3">{form.media.map((url) => { const featured = form.featured_media === url; return <div key={url} className={"group relative size-20 overflow-hidden rounded-md border-2 transition " + (featured ? "border-slate-900" : "border-transparent hover:border-slate-300")}><button type="button" onClick={() => setForm({ ...form, featured_media: url })} className="h-full w-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400" aria-label={featured ? "Featured image" : "Set as featured image"}><img src={url} alt="" className="h-full w-full object-cover" />{featured && <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-900/90 py-1 text-[10px] font-medium text-white"><Star size={11} fill="currentColor" />Featured</span>}</button><button type="button" onClick={() => removeMedia(url)} className="absolute right-1 top-1 grid size-6 place-items-center rounded-md bg-white/95 text-red-700 shadow-sm transition hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100" aria-label="Remove image" title="Remove image"><Trash2 size={13} /></button></div>; })}</div></div>}
        <label className="flex items-center gap-2 text-sm text-slate-700"><input className="size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400" type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />Show this item on the public catalog</label>
        {message && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}
        <div className="flex gap-2"><Button disabled={saving || !form.category_id}>{saving ? "Saving…" : editing ? "Update item" : "Add item"}</Button><Button type="button" variant="outline" onClick={() => router.push("/admin")}>Cancel</Button></div>
      </form>
    </section>
  </main>;
}
