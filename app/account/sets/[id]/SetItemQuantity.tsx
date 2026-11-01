"use client";

import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../../../lib/supabase/client";

export default function SetItemQuantity({ setItemId, quantity }: { setItemId: string; quantity: number }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  async function change(next: number) {
    if (next < 1 || next > 99) return;
    const supabase = createClient(); if (!supabase) return;
    setUpdating(true); const { error } = await supabase.from("project_set_items").update({ quantity: next }).eq("id", setItemId); if (!error) router.refresh(); setUpdating(false);
  }
  return <div className="flex h-9 items-center border border-slate-300 dark:border-[#3d3d41]"><button className="grid h-full w-9 place-items-center text-slate-500 hover:text-slate-950 disabled:opacity-40 dark:text-[#a0a0a7] dark:hover:text-white" onClick={() => change(quantity - 1)} disabled={updating || quantity <= 1} aria-label="Decrease quantity"><Minus size={13} /></button><span className="w-8 text-center text-sm font-bold">{quantity}</span><button className="grid h-full w-9 place-items-center text-slate-500 hover:text-slate-950 disabled:opacity-40 dark:text-[#a0a0a7] dark:hover:text-white" onClick={() => change(quantity + 1)} disabled={updating} aria-label="Increase quantity"><Plus size={13} /></button></div>;
}
