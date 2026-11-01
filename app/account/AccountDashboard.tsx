"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, FileText, LogOut, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import RentalFooter from "../../components/RentalFooter";
import RentalHeader from "../../components/RentalHeader";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { createClient } from "../../lib/supabase/client";

type ProjectSet = { id: string; title: string; created_at: string; project_set_items: { id: string }[] };

export default function AccountDashboard({ email, initialSets }: { email: string; initialSets: ProjectSet[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  async function createSet(event: FormEvent) {
    event.preventDefault(); if (!title.trim()) return;
    const supabase = createClient(); if (!supabase) return;
    setCreating(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Your session has expired. Please sign in again."); setCreating(false); return; }
    const { data, error: insertError } = await supabase.from("project_sets").insert({ title: title.trim(), user_id: user.id }).select("id").single();
    if (insertError) { setError(insertError.message); setCreating(false); return; }
    router.push(`/account/sets/${data.id}`); router.refresh();
  }
  async function signOut() { await createClient()?.auth.signOut(); router.push("/"); router.refresh(); }

  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white"><RentalHeader role="customer" quoteCount={initialSets.length} /><section className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase text-[#f54449]">Client workspace</p><h1 className="mt-2 text-4xl font-black">My quote lists</h1><p className="mt-3 text-sm text-slate-500 dark:text-[#9d9da4]">Save equipment now and prepare the complete rental request when the production is ready.</p></div><div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#8f8f96]"><span className="hidden sm:inline">{email}</span><Button variant="ghost" size="sm" onClick={signOut}><LogOut size={14} />Sign out</Button></div></div>
    <form onSubmit={createSet} className="mt-8 grid gap-2 border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto] dark:border-[#343438] dark:bg-[#1a1a1d]"><Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="Name this quote list, e.g. Kampot documentary" aria-label="Quote list name" /><Button disabled={creating}><Plus size={15} />{creating ? "Creating…" : "New quote"}</Button>{error && <p className="text-sm text-red-500 dark:text-red-400 sm:col-span-2">{error}</p>}</form>
    {initialSets.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{initialSets.map((set) => <Link key={set.id} href={`/account/sets/${set.id}`} className="group border border-slate-200 bg-white p-5 transition hover:border-[#f54449] dark:border-[#343438] dark:bg-[#1a1a1d]"><div className="flex items-start justify-between"><span className="grid size-10 place-items-center bg-slate-100 text-[#f54449] dark:bg-[#242427]"><FileText size={18} /></span><ArrowRight size={17} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#f54449] dark:text-[#77777f]" /></div><h2 className="mt-7 text-xl font-bold">{set.title}</h2><p className="mt-2 text-sm text-slate-500 dark:text-[#a0a0a7]">{set.project_set_items?.length ?? 0} equipment {(set.project_set_items?.length ?? 0) === 1 ? "item" : "items"}</p><p className="mt-5 text-xs uppercase text-slate-400 dark:text-[#77777f]">Created {new Date(set.created_at).toLocaleDateString()}</p></Link>)}</div> : <div className="mt-8 grid place-items-center border border-dashed border-slate-300 px-5 py-16 text-center dark:border-[#3a3a3e]"><FileText size={24} className="text-slate-400 dark:text-[#77777f]" /><h2 className="mt-4 font-bold">No quote lists yet</h2><p className="mt-2 text-sm text-slate-500 dark:text-[#96969d]">Create a quote above, then add equipment from the catalog.</p><Button asChild variant="outline" className="mt-5"><Link href="/catalog">Browse equipment</Link></Button></div>}
  </section><RentalFooter /></main>;
}
