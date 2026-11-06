"use client";

import { useState } from "react";
import { Eye, FileText, FolderHeart, ShieldCheck, UserRound, UsersRound, X } from "lucide-react";
import { Button } from "../../../components/ui/button";

type CatalogItem = { id: string; title: string; category: string; availability: string; featured_media: string | null; media: string[] };
type SetItem = { id: string; quantity: number; catalog_items: CatalogItem | CatalogItem[] | null };
export type AdminProjectSet = { id: string; user_id: string; title: string; created_at: string; project_set_items: SetItem[] };
type Profile = { id: string; email: string | null; display_name: string | null; role: "admin" | "customer"; created_at: string };

const availabilityClasses: Record<string, string> = { available: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300", limited: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300", unavailable: "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300" };

export default function AdminUserSets({ users, projectSets }: { users: Profile[]; projectSets: AdminProjectSet[] }) {
  const [selectedSet, setSelectedSet] = useState<AdminProjectSet | null>(null);
  const getItem = (setItem: SetItem) => Array.isArray(setItem.catalog_items) ? setItem.catalog_items[0] : setItem.catalog_items;
  const customerCount = users.filter((profile) => profile.role === "customer").length;

  return <>
    <div className="mb-8 grid gap-3 sm:grid-cols-3"><Stat icon={<UsersRound size={18} />} label="All accounts" value={users.length} /><Stat icon={<UserRound size={18} />} label="Customers" value={customerCount} /><Stat icon={<FileText size={18} />} label="Quote lists" value={projectSets.length} /></div>

    <section className="border border-slate-200 bg-white dark:border-[#343438] dark:bg-[#1a1a1d]">
      <div className="border-b border-slate-200 p-5 dark:border-[#343438]"><p className="text-xs font-bold uppercase text-[#f54449]">Account directory</p><h2 className="mt-1 text-xl font-black">Customer activity</h2><p className="mt-2 text-sm text-slate-500 dark:text-[#929299]">Open any quote list for a quick equipment preview.</p></div>
      {users.length ? <div>{users.map((profile) => {
        const userSets = projectSets.filter((set) => set.user_id === profile.id);
        const itemCount = userSets.reduce((total, set) => total + (set.project_set_items?.length ?? 0), 0);
        return <article key={profile.id} className="border-b border-slate-200 p-5 last:border-b-0 dark:border-[#303034]">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]"><div className="flex min-w-0 items-start gap-3"><span className="grid size-10 shrink-0 place-items-center bg-slate-100 text-slate-500 dark:bg-[#27272b] dark:text-[#9a9aa1]">{profile.role === "admin" ? <ShieldCheck size={17} /> : <UserRound size={17} />}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold">{profile.display_name || profile.email || "Unknown user"}</h3><span className={profile.role === "admin" ? "border border-slate-300 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:border-[#4a4a4f] dark:text-[#aaaab1]" : "border border-[#f54449]/40 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#e6383d] dark:bg-[#26191b]"}>{profile.role}</span></div><p className="mt-1 text-xs text-slate-500 dark:text-[#85858c]">{profile.email ? `${profile.email} · ` : ""}Joined {new Date(profile.created_at).toLocaleDateString()}</p></div></div><Metric label="Quote lists" value={userSets.length} /><Metric label="Saved items" value={itemCount} /></div>
          {userSets.length ? <div className="mt-5 border border-slate-200 dark:border-[#3a3a3e]"><div className="grid grid-cols-[1fr_auto_auto] gap-4 bg-slate-100 px-4 py-3 text-[10px] font-bold uppercase text-slate-500 dark:bg-[#151517] dark:text-[#77777f]"><span>Quote list</span><span>Items</span><span className="hidden sm:block">Created</span></div>{userSets.map((set) => <button type="button" key={set.id} onClick={() => setSelectedSet(set)} className="group grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-slate-200 px-4 py-3 text-left text-sm transition hover:bg-slate-50 dark:border-[#303034] dark:hover:bg-[#242427]"><span className="flex min-w-0 items-center gap-2 truncate font-bold"><Eye size={14} className="shrink-0 text-[#f54449]" />{set.title}</span><span className="text-slate-500 dark:text-[#8f8f96]">{set.project_set_items?.length ?? 0}</span><span className="hidden text-slate-500 dark:text-[#8f8f96] sm:block">{new Date(set.created_at).toLocaleDateString()}</span></button>)}</div> : <p className="mt-5 border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-[#3a3a3e] dark:text-[#8f8f96]">No quote lists created yet.</p>}
        </article>;
      })}</div> : <div className="grid place-items-center px-5 py-16 text-sm text-slate-500 dark:text-[#929299]">No user profiles found. Run the admin user visibility migration first.</div>}
    </section>

    {selectedSet && <div className="fixed inset-0 z-50 bg-slate-950/70" role="dialog" aria-modal="true" aria-label="Quote list preview" onClick={() => setSelectedSet(null)}><aside className="ml-auto flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-[#343438] dark:bg-[#151517]" onClick={(event) => event.stopPropagation()}><header className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-[#343438]"><div><p className="text-xs font-bold uppercase text-[#f54449]">Quote list preview</p><h2 className="mt-2 text-2xl font-black">{selectedSet.title}</h2><p className="mt-2 text-sm text-slate-500 dark:text-[#929299]">{selectedSet.project_set_items.length} saved {selectedSet.project_set_items.length === 1 ? "item" : "items"}</p></div><Button variant="ghost" size="sm" className="size-9 px-0" onClick={() => setSelectedSet(null)} aria-label="Close preview"><X size={18} /></Button></header><div className="flex-1 overflow-y-auto p-6">{selectedSet.project_set_items.length ? <div className="border border-slate-200 dark:border-[#3a3a3e]">{selectedSet.project_set_items.map((setItem) => { const item = getItem(setItem); if (!item) return null; const image = item.featured_media || item.media?.[0]; return <article key={setItem.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 border-b border-slate-200 p-3 last:border-b-0 dark:border-[#303034]"><div className="size-18 shrink-0 overflow-hidden bg-slate-100 dark:bg-[#27272b]">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-xs text-slate-400">No image</span>}</div><div className="min-w-0"><p className="text-[10px] font-bold uppercase text-[#f54449]">{item.category}</p><h3 className="mt-1 truncate font-bold">{item.title}</h3><span className={`mt-2 inline-flex border px-2 py-0.5 text-[10px] font-bold uppercase ${availabilityClasses[item.availability] ?? ""}`}>{item.availability}</span></div><span className="text-sm font-black">×{setItem.quantity}</span></article>; })}</div> : <div className="grid place-items-center gap-3 border border-dashed border-slate-300 px-5 py-16 text-center dark:border-[#3a3a3e]"><FolderHeart size={24} className="text-slate-400 dark:text-[#77777f]" /><p className="text-sm text-slate-500 dark:text-[#929299]">This quote list has no saved equipment.</p></div>}</div></aside></div>}
  </>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="border border-slate-200 bg-white p-5 dark:border-[#343438] dark:bg-[#1a1a1d]"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase text-slate-500 dark:text-[#8f8f96]">{label}</span><span className="text-[#f54449]">{icon}</span></div><strong className="mt-5 block text-3xl font-black">{value}</strong></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="min-w-20"><strong className="block text-xl font-black">{value}</strong><span className="text-[10px] font-bold uppercase text-slate-500 dark:text-[#77777f]">{label}</span></div>;
}
