"use client";

import Link from "next/link";
import { Check, Info, ShoppingCart } from "lucide-react";
import type { CatalogItem } from "../../lib/catalog";

const availabilityClasses: Record<CatalogItem["availability"], string> = {
  available: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  limited: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  unavailable: "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300",
};

const availabilityLabels: Record<CatalogItem["availability"], string> = {
  available: "Available",
  limited: "Limited availability",
  unavailable: "Unavailable",
};

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function HomeEquipmentCard({ item, allowQuote = true, inCart = false, adding = false, onAdd }: { item: CatalogItem; allowQuote?: boolean; inCart?: boolean; adding?: boolean; onAdd?: () => void }) {
  const image = item.featured_media || item.media?.[0];

  return <article className="group flex h-full flex-col border border-slate-200 bg-white p-3 transition hover:border-[#f54449] dark:border-[#343438] dark:bg-[#1a1a1d]">
    <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f5f5]">
      {image ? <img src={image} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <span className="grid h-full place-items-center text-sm text-slate-400">No image</span>}
      {inCart && <span className="absolute left-2 top-2 z-20 flex items-center gap-1 bg-emerald-600 px-2 py-1 text-[10px] font-bold uppercase text-white"><Check size={12} />In cart</span>}
      <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/55 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <Link href={`/catalog/${item.id}`} aria-label={`View details for ${item.title}`} title="View details" className="grid size-11 place-items-center border border-white/50 bg-[#171719]/90 text-white transition hover:border-[#f54449] hover:bg-[#f54449]"><Info size={19} /></Link>
        {allowQuote && item.availability !== "unavailable" && <button onClick={onAdd} disabled={inCart || adding} aria-label={inCart ? `${item.title} is in your cart` : `Add ${item.title} to cart`} title={inCart ? "Already in cart" : "Add to cart"} className={`grid size-11 place-items-center border text-white transition ${inCart ? "border-emerald-500 bg-emerald-600" : "border-white/50 bg-[#171719]/90 hover:border-[#f54449] hover:bg-[#f54449]"}`}>{inCart ? <Check size={19} /> : <ShoppingCart size={19} />}</button>}
      </div>
    </div>
    <p className="mt-4 text-[11px] font-bold uppercase text-[#f54449]">{item.category}</p>
    <Link href={`/catalog/${item.id}`} className="mt-1 block line-clamp-2 font-bold hover:text-[#f54449]">{item.title}</Link>
    <div className="mt-auto flex items-center justify-between gap-3 pt-3"><span className={`inline-flex w-fit border px-2.5 py-1 text-[11px] font-bold uppercase ${availabilityClasses[item.availability]}`}>{availabilityLabels[item.availability]}</span><span className="shrink-0 text-right text-sm font-black text-slate-950 dark:text-white">{item.daily_rate === null ? "Contact" : <>{usd.format(item.daily_rate)}<span className="ml-1 text-[10px] font-medium uppercase text-slate-500 dark:text-[#929299]">/ day</span></>}</span></div>
  </article>;
}
