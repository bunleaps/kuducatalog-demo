"use client";

import { useState } from "react";

export default function EquipmentGallery({ title, media }: { title: string; media: string[] }) {
  const [selected, setSelected] = useState(media[0] ?? "");

  return <div className={media.length > 1 ? "grid gap-3 sm:grid-cols-[84px_1fr]" : ""}>
    {media.length > 1 && <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">{media.map((image, index) => <button key={image} type="button" onClick={() => setSelected(image)} className={`size-18 shrink-0 overflow-hidden border-2 bg-white transition sm:size-20 ${selected === image ? "border-[#f54449]" : "border-slate-200 hover:border-slate-400 dark:border-[#343438]"}`} aria-label={`Show image ${index + 1} of ${title}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div>}
    <div className="order-1 aspect-[4/3] overflow-hidden bg-white dark:bg-[#1a1a1d] sm:order-2">{selected ? <img src={selected} alt={title} className="h-full w-full object-contain" /> : <div className="grid h-full place-items-center text-slate-400">No image available</div>}</div>
  </div>;
}
