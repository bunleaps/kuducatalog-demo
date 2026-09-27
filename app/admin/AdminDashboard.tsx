"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Boxes, CircleOff, ExternalLink, LogOut, PackageCheck, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { createClient } from "../../lib/supabase/client";
import AdminTabs from "./AdminTabs";

type Item = { id: string; title: string; category: string; availability: string; media: string[]; featured_media: string | null; is_published: boolean };
const availabilityClasses: Record<string, string> = { available: "border-green-200 bg-green-50 text-green-700", limited: "border-amber-200 bg-amber-50 text-amber-700", unavailable: "border-red-200 bg-red-50 text-red-700" };
const availabilityLabels: Record<string, string> = { available: "Available", limited: "Limited", unavailable: "Unavailable" };

export default function AdminDashboard({ initialItems, userEmail }: { initialItems: Item[]; userEmail: string }) {
  const router = useRouter();
  const supabase = createClient();
  const published = initialItems.filter((item) => item.is_published).length;
  const unavailable = initialItems.filter((item) => item.availability === "unavailable").length;
  async function remove(id: string) { if (!supabase || !confirm("Delete this catalog item?")) return; const { error } = await supabase.from("catalog_items").delete().eq("id", id); if (!error) router.refresh(); }
  async function signOut() { await supabase?.auth.signOut(); router.push("/"); router.refresh(); }

  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white">R</span>RENT4SET <span className="font-normal text-slate-400">/ Admin</span></Link><div className="flex items-center gap-2"><span className="hidden text-xs text-slate-500 sm:block">{userEmail}</span><Button variant="ghost" size="sm" onClick={signOut}><LogOut size={14} />Sign out</Button></div></div></header>
    <AdminTabs active="catalog" />
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Overview</p><h1 className="text-3xl font-semibold tracking-tight">Catalog</h1><p className="mt-2 text-sm text-slate-500">Manage the equipment available in your RENT4SET catalog.</p></div><Button asChild><Link href="/admin/new"><Plus size={16} />Add item</Link></Button></div>
      <div className="mb-9 grid gap-3 sm:grid-cols-3"><StatCard icon={<Boxes size={16} />} label="Total items" value={initialItems.length} /><StatCard icon={<PackageCheck size={16} />} label="Published" value={published} /><StatCard icon={<CircleOff size={16} />} label="Unavailable" value={unavailable} /></div>
      <section><div className="flex items-center justify-between border-b border-slate-200 pb-3"><div><h2 className="text-base font-semibold">All items <span className="ml-1 text-sm font-normal text-slate-500">{initialItems.length}</span></h2><p className="mt-1 text-sm text-slate-500">Your current catalog inventory</p></div><Button asChild variant="outline" size="sm"><Link href="/"><ExternalLink size={14} />View catalog</Link></Button></div>
      {initialItems.length ? <div>{initialItems.map((item) => <article className="flex items-center gap-3 border-b border-slate-200 py-3" key={item.id}><div className="size-11 shrink-0 overflow-hidden rounded-md bg-slate-100">{(item.featured_media || item.media?.[0]) && <img src={item.featured_media || item.media[0]} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><strong className="block truncate text-sm font-medium">{item.title}</strong><span className="text-xs text-slate-500">{item.category}</span></div><Badge variant="secondary" className={"hidden sm:inline-flex " + (availabilityClasses[item.availability] ?? "")}>{availabilityLabels[item.availability] ?? item.availability}</Badge><span className={item.is_published ? "hidden min-w-15 text-xs text-green-700 md:block" : "hidden min-w-15 text-xs text-slate-500 md:block"}>{item.is_published ? "Published" : "Hidden"}</span><Button asChild variant="ghost" size="sm" className="size-9 px-0"><Link href={"/admin/edit/" + item.id} aria-label={"Edit " + item.title} title="Edit item"><Pencil size={15} /></Link></Button><button className="grid size-9 place-items-center rounded-md text-red-700 transition hover:bg-red-50" onClick={() => remove(item.id)} aria-label={"Delete " + item.title} title="Delete item"><Trash2 size={15} /></button></article>)}</div> : <div className="grid place-items-center gap-3 rounded-b-lg border border-t-0 border-slate-200 bg-white px-5 py-14 text-center"><p className="text-sm text-slate-500">No catalog items yet.</p><Button asChild size="sm"><Link href="/admin/new"><Plus size={15} />Add your first item</Link></Button></div>}</section>
    </section>
  </main>;
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><span className="flex items-center gap-1.5 text-xs text-slate-500">{icon}{label}</span><strong className="mt-3 block text-2xl font-semibold tracking-tight">{value}</strong></div>;
}
