import Link from "next/link";
import { Boxes, CalendarDays, ExternalLink, Link2Off, PackageOpen } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import ThemeToggle from "../../../components/ThemeToggle";
import { createClient } from "../../../lib/supabase/server";

type SharedItem = { id: string; quantity: number; title: string; category: string; availability: string; featured_media: string | null; media: string[] };
type SharedSet = { id: string; title: string; created_at: string; items: SharedItem[] };

const availabilityClasses: Record<string, string> = { available: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300", limited: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300", unavailable: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300" };
const availabilityLabels: Record<string, string> = { available: "Available", limited: "Limited availability", unavailable: "Unavailable" };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function SharedSetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const result = supabase && uuidPattern.test(token) ? await supabase.rpc("get_shared_project_set", { p_token: token }) : { data: null };
  const sharedSet = result.data as SharedSet | null;

  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white dark:bg-slate-100 dark:text-slate-950">R</span>RENT4SET</Link><ThemeToggle /></div></header>
    {!sharedSet ? <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-lg place-items-center px-4 py-12 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Link2Off size={22} /></span><h1 className="mt-5 text-2xl font-semibold tracking-tight">This shared set is unavailable</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The link may be invalid, or the owner may have disabled sharing.</p><Button asChild className="mt-6"><Link href="/"><Boxes size={15} />Browse the catalog</Link></Button></div></section> : <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8"><p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"><ExternalLink size={14} />Shared equipment list</p><h1 className="text-3xl font-semibold tracking-tight">{sharedSet.title}</h1><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400"><span className="flex items-center gap-1.5"><PackageOpen size={15} />{sharedSet.items.length} {sharedSet.items.length === 1 ? "item" : "items"}</span><span className="flex items-center gap-1.5"><CalendarDays size={15} />Created {new Date(sharedSet.created_at).toLocaleDateString()}</span></div></div>
      {sharedSet.items.length ? <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">{sharedSet.items.map((item) => { const image = item.featured_media || item.media?.[0]; return <article key={item.id} className="flex items-center gap-4 border-b border-slate-200 p-4 last:border-b-0 dark:border-slate-800"><div className="size-16 shrink-0 overflow-hidden rounded-md bg-slate-100 sm:size-20 dark:bg-slate-800">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-xs text-slate-400 dark:text-slate-500">No image</span>}</div><div className="min-w-0 flex-1"><p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.category}</p><h2 className="mt-1 truncate text-sm font-semibold sm:text-base">{item.title}</h2><div className="mt-2 flex flex-wrap items-center gap-2"><Badge variant="secondary" className={availabilityClasses[item.availability] ?? ""}>{availabilityLabels[item.availability] ?? item.availability}</Badge>{item.quantity > 1 && <span className="text-xs text-slate-500 dark:text-slate-400">Quantity: {item.quantity}</span>}</div></div></article>; })}</div> : <div className="grid place-items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white px-5 py-16 text-center dark:border-slate-700 dark:bg-slate-900"><PackageOpen size={22} className="text-slate-400 dark:text-slate-500" /><div><h2 className="text-sm font-semibold">This set is empty</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The owner has not added any equipment yet.</p></div></div>}
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"><p className="font-medium text-slate-950 dark:text-slate-50">Shared for planning purposes</p><p className="mt-1">This equipment list is read-only and does not confirm availability, pricing, or a reservation.</p></div>
    </section>}
  </main>;
}
