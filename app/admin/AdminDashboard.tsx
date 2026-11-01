"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Boxes, CircleOff, ExternalLink, PackageCheck, Pencil, Plus, Trash2 } from "lucide-react";
import AdminHeader from "../../components/AdminHeader";
import RentalFooter from "../../components/RentalFooter";
import { Button } from "../../components/ui/button";
import { createClient } from "../../lib/supabase/client";
import AdminTabs from "./AdminTabs";

type Item = { id: string; title: string; category: string; availability: string; media: string[]; featured_media: string | null; is_published: boolean };
const availabilityClasses: Record<string, string> = { available: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300", limited: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300", unavailable: "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300" };
const availabilityLabels: Record<string, string> = { available: "Available", limited: "Limited", unavailable: "Unavailable" };

export default function AdminDashboard({ initialItems, userEmail }: { initialItems: Item[]; userEmail: string }) {
  const router = useRouter();
  const supabase = createClient();
  const published = initialItems.filter((item) => item.is_published).length;
  const unavailable = initialItems.filter((item) => item.availability === "unavailable").length;
  async function remove(id: string) { if (!supabase || !confirm("Delete this catalog item?")) return; const { error } = await supabase.from("catalog_items").delete().eq("id", id); if (!error) router.refresh(); }

  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white">
    <AdminHeader email={userEmail} />
    <AdminTabs active="catalog" />
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 dark:border-[#303034] sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase text-[#f54449]">Inventory management</p><h1 className="mt-3 text-4xl font-black">Equipment catalog</h1><p className="mt-2 text-sm text-slate-500 dark:text-[#929299]">Publish, update and organize the equipment available to customers.</p></div><Button asChild size="lg"><Link href="/admin/new"><Plus size={16} />Add equipment</Link></Button></div>

      <div className="my-8 grid gap-3 sm:grid-cols-3"><StatCard icon={<Boxes size={18} />} label="Total equipment" value={initialItems.length} /><StatCard icon={<PackageCheck size={18} />} label="Published" value={published} /><StatCard icon={<CircleOff size={18} />} label="Unavailable" value={unavailable} /></div>

      <section className="border border-slate-200 bg-white dark:border-[#343438] dark:bg-[#1a1a1d]"><div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-[#343438] sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase text-[#f54449]">Current inventory · {initialItems.length}</p><h2 className="mt-1 text-xl font-black">Catalog items</h2></div><Button asChild variant="outline" size="sm"><Link href="/catalog"><ExternalLink size={14} />View public catalog</Link></Button></div>
        {initialItems.length ? <div>{initialItems.map((item) => { const image = item.featured_media || item.media?.[0]; return <article className="grid grid-cols-[56px_1fr_auto] items-center gap-4 border-b border-slate-200 p-4 last:border-b-0 dark:border-[#303034] md:grid-cols-[56px_1fr_auto_auto_auto]" key={item.id}><div className="size-14 shrink-0 overflow-hidden bg-slate-100 dark:bg-[#27272b]">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}</div><div className="min-w-0"><strong className="block truncate text-sm font-bold">{item.title}</strong><span className="mt-1 block text-xs uppercase text-slate-500 dark:text-[#8f8f96]">{item.category}</span></div><span className={`hidden border px-3 py-1 text-[11px] font-bold uppercase sm:inline-flex ${availabilityClasses[item.availability] ?? ""}`}>{availabilityLabels[item.availability] ?? item.availability}</span><span className={item.is_published ? "hidden text-xs font-bold uppercase text-emerald-600 md:block dark:text-emerald-400" : "hidden text-xs font-bold uppercase text-slate-400 md:block"}>{item.is_published ? "Published" : "Hidden"}</span><div className="flex items-center justify-end"><Button asChild variant="ghost" size="sm" className="size-9 px-0"><Link href={`/admin/edit/${item.id}`} aria-label={`Edit ${item.title}`}><Pencil size={15} /></Link></Button><button className="grid size-9 place-items-center text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/50" onClick={() => remove(item.id)} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button></div></article>; })}</div> : <div className="grid place-items-center px-5 py-16 text-center"><p className="text-sm text-slate-500 dark:text-[#929299]">No equipment has been added yet.</p><Button asChild className="mt-5"><Link href="/admin/new"><Plus size={15} />Add your first item</Link></Button></div>}
      </section>
    </section>
    <RentalFooter />
  </main>;
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="border border-slate-200 bg-white p-5 dark:border-[#343438] dark:bg-[#1a1a1d]"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase text-slate-500 dark:text-[#8f8f96]">{label}</span><span className="text-[#f54449]">{icon}</span></div><strong className="mt-5 block text-3xl font-black">{value}</strong></div>;
}
