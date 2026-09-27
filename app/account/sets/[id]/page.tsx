import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Boxes, Heart } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { createClient } from "../../../../lib/supabase/server";
import RemoveSetItemButton from "./RemoveSetItemButton";

type SavedItem = {
  id: string;
  quantity: number;
  catalog_items: { id: string; title: string; category: string; availability: string; featured_media: string | null; media: string[] } | { id: string; title: string; category: string; availability: string; featured_media: string | null; media: string[] }[] | null;
};

type ProjectSet = { id: string; title: string; created_at: string; project_set_items: SavedItem[] };

const availabilityClasses: Record<string, string> = { available: "border-green-200 bg-green-50 text-green-700", limited: "border-amber-200 bg-amber-50 text-amber-700", unavailable: "border-red-200 bg-red-50 text-red-700" };

export default async function ProjectSetPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const { data } = await supabase.from("project_sets").select("id,title,created_at,project_set_items(id,quantity,catalog_items(id,title,category,availability,featured_media,media))").eq("id", id).single();
  if (!data) notFound();
  const projectSet = data as unknown as ProjectSet;
  const getCatalogItem = (savedItem: SavedItem) => Array.isArray(savedItem.catalog_items) ? savedItem.catalog_items[0] : savedItem.catalog_items;
  const savedItems = projectSet.project_set_items.filter((item) => getCatalogItem(item));

  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white">R</span>RENT4SET</Link><Button asChild variant="ghost" size="sm"><Link href="/account"><ArrowLeft size={15} />All sets</Link></Button></div></header><section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10"><div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Project set</p><h1 className="text-3xl font-semibold tracking-tight">{projectSet.title}</h1><p className="mt-2 text-sm text-slate-500">{savedItems.length} saved {savedItems.length === 1 ? "item" : "items"} · Created {new Date(projectSet.created_at).toLocaleDateString()}</p></div><Button asChild variant="outline"><Link href="/"><Boxes size={15} />Add more equipment</Link></Button></div>{savedItems.length ? <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">{savedItems.map((savedItem) => { const item = getCatalogItem(savedItem)!; const image = item.featured_media || item.media?.[0]; return <article key={savedItem.id} className="flex items-center gap-4 border-b border-slate-200 p-4 last:border-b-0"><div className="size-16 shrink-0 overflow-hidden rounded-md bg-slate-100 sm:size-20">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-xs text-slate-400">No image</span>}</div><div className="min-w-0 flex-1"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.category}</p><h2 className="mt-1 truncate text-sm font-semibold">{item.title}</h2><div className="mt-2 flex items-center gap-2"><Badge variant="secondary" className={availabilityClasses[item.availability] ?? ""}>{item.availability}</Badge>{savedItem.quantity > 1 && <span className="text-xs text-slate-500">×{savedItem.quantity}</span>}</div></div><RemoveSetItemButton setItemId={savedItem.id} itemTitle={item.title} /></article>; })}</div> : <div className="grid place-items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white px-5 py-16 text-center"><Heart size={22} className="text-slate-400" /><div><h2 className="text-sm font-semibold">This set is empty</h2><p className="mt-1 text-sm text-slate-500">Browse available equipment and save it to this project set.</p></div><Button asChild size="sm"><Link href="/"><Boxes size={15} />Browse catalog</Link></Button></div>}</section></main>;
}
