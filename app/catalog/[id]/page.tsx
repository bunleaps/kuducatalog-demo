import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ContactRail from "../../../components/ContactRail";
import RentalFooter from "../../../components/RentalFooter";
import RentalHeader from "../../../components/RentalHeader";
import { getPublicCatalog } from "../../../lib/catalog";
import { getViewer } from "../../../lib/viewer";
import EquipmentDetailActions from "./EquipmentDetailActions";
import EquipmentGallery from "./EquipmentGallery";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 });

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function EquipmentDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ set?: string }> }) {
  const [{ items }, viewer, { id }, filters] = await Promise.all([getPublicCatalog(), getViewer(), params, searchParams]);
  const item = items.find((entry) => entry.id === id);
  if (!item) notFound();
  const { data: targetSet } = viewer.role === "customer" && filters.set && uuidPattern.test(filters.set)
    ? await viewer.supabase!.from("project_sets").select("id").eq("id", filters.set).eq("user_id", viewer.user.id).maybeSingle()
    : { data: null };
  const media = Array.from(new Set([item.featured_media, ...(item.media ?? [])].filter(Boolean))) as string[];
  const specs = item.short_specs?.filter(Boolean).slice(0, 6) ?? [];
  const displaySpecs = specs.length ? specs : [`${item.category} equipment`, "Rental support available"];
  const related = items.filter((entry) => entry.id !== item.id && entry.category.trim() === item.category.trim()).slice(0, 4);

  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white">
    <RentalHeader role={viewer.role} quoteCount={viewer.quoteCount} favoriteCount={viewer.favoriteCount} />
    <ContactRail />
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href={targetSet ? `/catalog?set=${targetSet.id}` : "/catalog"} className="inline-flex items-center gap-2 text-xs font-bold uppercase text-slate-500 hover:text-[#f54449]"><ArrowLeft size={14} />Equipment catalog</Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-[1.12fr_.88fr]">
        <EquipmentGallery title={item.title} media={media} />
        <aside className="relative h-fit lg:sticky lg:top-6">
          <p className="text-xs font-bold uppercase text-[#f54449]">{item.category}</p>
          <h1 className="mt-3 pr-12 text-3xl font-black leading-tight sm:text-4xl">{item.title}</h1>
          <div className="mt-6 grid gap-5 border-y border-slate-200 py-5 dark:border-[#343438] sm:grid-cols-[1fr_auto] sm:items-start"><ul className="grid gap-2 text-sm text-slate-600 dark:text-[#c0c0c6]">{displaySpecs.map((spec) => <li key={spec} className="flex items-start gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#f54449]" /><span>{spec}</span></li>)}</ul><div className="border-t border-slate-200 pt-4 dark:border-[#343438] sm:min-w-40 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0"><p className="text-[10px] font-bold uppercase text-slate-500">Rental rate</p>{item.daily_rate === null ? <p className="mt-2 text-xl font-black">Contact for rate</p> : <p className="mt-2 text-2xl font-black">{usd.format(item.daily_rate)} <span className="text-xs font-medium text-slate-500 dark:text-[#929299]">/ day</span></p>}</div></div>
          {item.description && <div className="mt-6 text-sm leading-6 text-slate-600 dark:text-[#c0c0c6] [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p]:my-2 [&_strong]:font-bold [&_strong]:text-slate-950 dark:[&_strong]:text-white"><p className="mb-3 text-[10px] font-bold uppercase text-slate-500">Description</p><ReactMarkdown remarkPlugins={[remarkGfm]}>{item.description}</ReactMarkdown></div>}
          <EquipmentDetailActions itemId={item.id} userId={viewer.role === "customer" ? viewer.user?.id : undefined} availability={item.availability} targetSetId={targetSet?.id} />
          <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-[#929299]">Availability, support and final rental terms are confirmed by the RENT4SET team after reviewing the request.</p>
        </aside>
      </div>

      {related.length > 0 && <section className="mt-14 border-t border-slate-200 pt-10 dark:border-[#343438]"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase text-[#f54449]">Related equipment</p><h2 className="mt-2 text-2xl font-black">Build out the set</h2></div><Link href={`/catalog?category=${encodeURIComponent(item.category)}${targetSet ? `&set=${targetSet.id}` : ""}`} className="hidden items-center gap-2 text-xs font-bold uppercase hover:text-[#f54449] sm:flex">View category <ArrowRight size={14} /></Link></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((entry) => { const image = entry.featured_media || entry.media?.[0]; return <Link key={entry.id} href={`/catalog/${entry.id}${targetSet ? `?set=${targetSet.id}` : ""}`} className="group border border-slate-200 bg-white p-3 hover:border-[#f54449] dark:border-[#343438] dark:bg-[#1a1a1d]"><div className="aspect-[4/3] overflow-hidden bg-[#f5f5f5]">{image ? <img src={image} alt={entry.title} className="h-full w-full object-cover transition group-hover:scale-[1.02]" /> : <span className="grid h-full place-items-center text-xs text-slate-400">No image</span>}</div><p className="mt-3 text-[11px] font-bold uppercase text-[#f54449]">{entry.category}</p><h3 className="mt-1 line-clamp-2 font-bold">{entry.title}</h3><p className="mt-2 text-xs text-slate-500 dark:text-[#929299]">{entry.daily_rate === null ? "Contact for rate" : `${usd.format(entry.daily_rate)} / day`}</p></Link>; })}</div></section>}
    </section>
    <RentalFooter />
  </main>;
}
