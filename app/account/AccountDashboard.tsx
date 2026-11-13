"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, FileText, LogOut, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import RentalFooter from "../../components/RentalFooter";
import RentalHeader from "../../components/RentalHeader";
import { Button } from "../../components/ui/button";
import { createClient } from "../../lib/supabase/client";

type ProjectSet = {
  id: string;
  title: string;
  created_at: string;
  is_active: boolean;
  project_set_items: { id: string; quantity: number }[];
};

export default function AccountDashboard({ email, initialSets, favoriteCount = 0 }: { email: string; initialSets: ProjectSet[]; favoriteCount?: number }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const activeCart = initialSets.find((set) => set.is_active);
  const savedSets = initialSets.filter((set) => !set.is_active);
  const activeCount = activeCart?.project_set_items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  async function startCart() {
    if (activeCart) { router.push(`/account/sets/${activeCart.id}`); return; }
    const supabase = createClient(); if (!supabase) return;
    setCreating(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Your session has expired. Please sign in again."); setCreating(false); return; }
    const { data, error: insertError } = await supabase.from("project_sets").insert({ title: "Untitled quote", user_id: user.id, is_active: true }).select("id").single();
    if (insertError) { setError(insertError.message); setCreating(false); return; }
    router.push(`/account/sets/${data.id}`); router.refresh();
  }

  async function signOut() { await createClient()?.auth.signOut(); router.push("/"); router.refresh(); }

  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white"><RentalHeader role="customer" quoteCount={activeCount} favoriteCount={favoriteCount} /><section className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase text-[#f54449]">Client workspace</p><h1 className="mt-2 text-4xl font-black">My quote lists</h1><p className="mt-3 text-sm text-slate-500 dark:text-[#9d9da4]">Build one current cart, then name it when you prepare the rental request.</p></div><div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#8f8f96]"><span className="hidden sm:inline">{email}</span><Button variant="ghost" size="sm" onClick={signOut}><LogOut size={14} />Sign out</Button></div></div>
    <section className="mt-8 border border-slate-200 bg-white p-5 dark:border-[#343438] dark:bg-[#1a1a1d]"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="grid size-11 place-items-center bg-[#f54449] text-white"><ShoppingCart size={19} /></span><div><p className="text-xs font-bold uppercase text-[#f54449]">Current cart</p><h2 className="mt-1 text-xl font-black">{activeCart ? `${activeCount} selected ${activeCount === 1 ? "item" : "items"}` : "No active cart"}</h2><p className="mt-1 text-sm text-slate-500 dark:text-[#9d9da4]">{activeCart ? "Review equipment or continue to project details." : "Add equipment from the catalog or start an empty cart."}</p></div></div><Button onClick={startCart} disabled={creating}>{activeCart ? <>View cart <ArrowRight size={15} /></> : <><Plus size={15} />{creating ? "Starting…" : "Start a cart"}</>}</Button></div>{error && <p className="mt-4 text-sm text-red-500">{error}</p>}</section>
    <div className="mt-10 flex items-end justify-between"><div><h2 className="text-xl font-black">Saved quote lists</h2><p className="mt-1 text-sm text-slate-500 dark:text-[#9d9da4]">Named projects that have moved to the request stage.</p></div><span className="text-xs font-bold uppercase text-slate-400">{savedSets.length} total</span></div>
    {savedSets.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{savedSets.map((set) => <Link key={set.id} href={`/account/sets/${set.id}`} className="group border border-slate-200 bg-white p-5 transition hover:border-[#f54449] dark:border-[#343438] dark:bg-[#1a1a1d]"><div className="flex items-start justify-between"><span className="grid size-10 place-items-center bg-slate-100 text-[#f54449] dark:bg-[#242427]"><FileText size={18} /></span><ArrowRight size={17} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#f54449]" /></div><h3 className="mt-7 text-xl font-bold">{set.title}</h3><p className="mt-2 text-sm text-slate-500 dark:text-[#a0a0a7]">{set.project_set_items?.length ?? 0} equipment {(set.project_set_items?.length ?? 0) === 1 ? "item" : "items"}</p><p className="mt-5 text-xs uppercase text-slate-400">Created {new Date(set.created_at).toLocaleDateString()}</p></Link>)}</div> : <div className="mt-5 grid place-items-center border border-dashed border-slate-300 px-5 py-12 text-center dark:border-[#3a3a3e]"><FileText size={24} className="text-slate-400" /><h3 className="mt-4 font-bold">No saved quote lists yet</h3><p className="mt-2 text-sm text-slate-500">Complete the project details for your current cart and it will appear here.</p><Button asChild variant="outline" className="mt-5"><Link href="/catalog">Browse equipment</Link></Button></div>}
  </section><RentalFooter /></main>;
}
