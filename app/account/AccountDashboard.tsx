"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, ChevronRight, FolderPlus, Heart, LogOut, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
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
    const { error: insertError } = await supabase.from("project_sets").insert({ title: title.trim(), user_id: user.id });
    if (insertError) { setError(insertError.message); setCreating(false); return; }
    setTitle(""); router.refresh(); setCreating(false);
  }
  async function signOut() { await createClient()?.auth.signOut(); router.push("/"); router.refresh(); }
  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white">R</span>RENT4SET</Link><div className="flex items-center gap-2"><span className="hidden text-xs text-slate-500 sm:block">{email}</span><Button variant="ghost" size="sm" onClick={signOut}><LogOut size={14} />Sign out</Button></div></div></header><section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10"><div className="mb-7"><p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Your workspace</p><h1 className="text-3xl font-semibold tracking-tight">Project sets</h1><p className="mt-2 text-sm text-slate-500">Build equipment lists now and come back to them when you are ready to rent.</p></div><form onSubmit={createSet} className="mb-8 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="e.g. Documentary shoot — October" aria-label="Project set name" /><Button disabled={creating}><Plus size={15} />{creating ? "Creating…" : "New set"}</Button>{error && <p className="self-center text-sm text-red-700">{error}</p>}</form>{initialSets.length ? <div className="grid gap-3 sm:grid-cols-2">{initialSets.map((set) => <Link key={set.id} href={"/account/sets/" + set.id} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400"><Heart size={17} className="mb-4 text-slate-500" /><div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold">{set.title}</h2><p className="mt-1 text-sm text-slate-500">{set.project_set_items?.length ?? 0} saved {(set.project_set_items?.length ?? 0) === 1 ? "item" : "items"}</p></div><ChevronRight size={18} className="mt-0.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" /></div><p className="mt-4 text-xs text-slate-400">Created {new Date(set.created_at).toLocaleDateString()}</p></Link>)}</div> : <div className="grid place-items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white px-5 py-16 text-center"><FolderPlus size={22} className="text-slate-400" /><div><h2 className="text-sm font-semibold">No project sets yet</h2><p className="mt-1 text-sm text-slate-500">Create one here, then save available items from the catalog.</p></div><Button asChild variant="outline" size="sm"><Link href="/"><ArrowLeft size={14} />Browse catalog</Link></Button></div>}</section></main>;
}
