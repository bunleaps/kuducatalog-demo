import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Boxes, CalendarDays, ChevronRight, PackageOpen, Truck } from "lucide-react";
import RentalFooter from "../../../../components/RentalFooter";
import RentalHeader from "../../../../components/RentalHeader";
import { Button } from "../../../../components/ui/button";
import { createClient } from "../../../../lib/supabase/server";
import ExportSetPdfButton from "./ExportSetPdfButton";
import RemoveSetItemButton from "./RemoveSetItemButton";
import SetItemQuantity from "./SetItemQuantity";
import ShareSetButton from "./ShareSetButton";

type SavedItem = { id: string; quantity: number; catalog_items: CatalogItem | CatalogItem[] | null };
type CatalogItem = { id: string; title: string; category: string; availability: string; featured_media: string | null; media: string[] };
type ProjectSet = { id: string; title: string; created_at: string; collection_date?: string | null; return_date?: string | null; fulfillment?: string | null; project_set_items: SavedItem[] };
function formatRange(start?: string | null, end?: string | null) {
  if (!start || !end) return "Add rental dates";
  const date = (value: string) => { const [y, m, d] = value.split("-").map(Number); return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(y, m - 1, d)); };
  return `${date(start)} – ${date(end)}`;
}

export default async function ProjectSetPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient(); if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const { id } = await params;
  const [{ data }, { count }, { count: favoriteCount }] = await Promise.all([
    supabase.from("project_sets").select("*,project_set_items(id,quantity,catalog_items(id,title,category,availability,featured_media,media))").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("project_sets").select("id", { count: "exact", head: true }),
    supabase.from("favorites").select("catalog_item_id", { count: "exact", head: true }),
  ]);
  if (!data) notFound();
  const projectSet = data as unknown as ProjectSet;
  const getItem = (saved: SavedItem) => Array.isArray(saved.catalog_items) ? saved.catalog_items[0] : saved.catalog_items;
  const savedItems = projectSet.project_set_items.filter((item) => getItem(item));
  const exportItems = savedItems.map((saved) => { const item = getItem(saved)!; return { title: item.title, category: item.category, availability: item.availability, quantity: saved.quantity }; });
  const totalQuantity = savedItems.reduce((total, item) => total + item.quantity, 0);

  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white"><RentalHeader role="customer" quoteCount={count ?? 0} favoriteCount={favoriteCount ?? 0} /><section className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><Link href="/account" className="inline-flex items-center gap-2 text-xs font-bold uppercase text-slate-500 hover:text-slate-950 dark:text-[#8f8f96] dark:hover:text-white"><ArrowLeft size={14} />All quote lists</Link><div className="mt-7"><p className="text-xs font-bold uppercase text-[#f54449]">My quote list</p><h1 className="mt-2 text-4xl font-black">{savedItems.length ? `${savedItems.length} ${savedItems.length === 1 ? "item" : "items"} selected` : projectSet.title}</h1><p className="mt-2 text-sm text-slate-500 dark:text-[#9d9da4]">{projectSet.title} · Your list is saved. Pricing and availability are confirmed after contact.</p></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_330px]">
      <section className="border border-slate-200 bg-white p-5 dark:border-[#343438] dark:bg-[#1a1a1d]"><div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-[#343438]"><h2 className="font-bold">Equipment</h2><span className="text-xs uppercase text-slate-500 dark:text-[#8f8f96]">Quantity</span></div>{savedItems.length ? <div>{savedItems.map((saved) => { const item = getItem(saved)!; const image = item.featured_media || item.media?.[0]; return <article key={saved.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-slate-200 py-5 dark:border-[#2e2e32] sm:grid-cols-[76px_1fr_auto_auto]"><div className="size-16 overflow-hidden bg-[#f4f4f4] sm:size-19">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}</div><div className="min-w-0"><h3 className="truncate font-bold">{item.title}</h3><p className="mt-2 text-xs text-slate-500 dark:text-[#97979e]">{item.category} · {item.availability}</p></div><SetItemQuantity setItemId={saved.id} quantity={saved.quantity} /><div className="col-start-3 justify-self-end sm:col-auto"><RemoveSetItemButton setItemId={saved.id} itemTitle={item.title} /></div></article>; })}</div> : <div className="grid place-items-center py-14 text-center"><PackageOpen size={23} className="text-slate-400 dark:text-[#77777f]" /><p className="mt-3 text-sm text-slate-500 dark:text-[#9999a0]">This quote list is empty.</p><Button asChild variant="outline" className="mt-5"><Link href="/catalog"><Boxes size={15} />Add equipment</Link></Button></div>}
        <div className="mt-6 flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/catalog"><Boxes size={15} />Add equipment</Link></Button><ShareSetButton projectSetId={projectSet.id} /><ExportSetPdfButton title={projectSet.title} createdAt={projectSet.created_at} items={exportItems} /></div>
      </section>
      <aside className="h-fit bg-[#f4f3ef] p-6 text-slate-950">
        <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-black">Request summary</h2>{savedItems.length ? <Link href={`/account/sets/${projectSet.id}/request`} className="text-xs font-bold uppercase text-[#e6383d] hover:underline">Edit details</Link> : null}</div>
        <div className="mt-6"><p className="text-xs font-bold uppercase">Rental dates</p>{savedItems.length ? <Link href={`/account/sets/${projectSet.id}/request`} className="mt-3 flex items-center gap-3 border border-slate-300 bg-white p-4 text-sm font-medium transition-colors hover:border-[#f54449]"><CalendarDays size={17} className="text-[#f54449]" /><span className="flex-1">{formatRange(projectSet.collection_date, projectSet.return_date)}</span><ChevronRight size={16} /></Link> : <div className="mt-3 border border-slate-300 bg-white p-4 text-sm text-slate-500">Add equipment first</div>}</div>
        <div className="mt-5"><p className="text-xs font-bold uppercase">Fulfilment</p>{savedItems.length ? <Link href={`/account/sets/${projectSet.id}/request`} className="mt-3 flex items-center gap-3 border border-slate-300 bg-white p-4 text-sm transition-colors hover:border-[#f54449]"><Truck size={17} className="text-[#f54449]" /><span className="flex-1">{projectSet.fulfillment === "delivery_request" ? "Delivery requested" : "Self pickup · Phnom Penh"}</span><ChevronRight size={16} /></Link> : <div className="mt-3 border border-slate-300 bg-white p-4 text-sm text-slate-500">Selected during request</div>}</div>
        <div className="my-6 border-t border-slate-300" /><dl className="grid gap-3 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Equipment quantity</dt><dd className="font-bold">{totalQuantity}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Pricing</dt><dd className="font-bold">Confirmed by KUDU</dd></div></dl>
        {savedItems.length ? <Button asChild className="mt-8 w-full" size="lg"><Link href={`/account/sets/${projectSet.id}/request`}>{projectSet.collection_date && projectSet.return_date ? "Review request" : "Add request details"} <ChevronRight size={16} /></Link></Button> : <Button className="mt-8 w-full" size="lg" disabled>Add request details <ChevronRight size={16} /></Button>}
        <p className="mt-3 text-center text-xs text-slate-500">No payment required now</p>
      </aside>
    </div>
  </section><RentalFooter /></main>;
}
