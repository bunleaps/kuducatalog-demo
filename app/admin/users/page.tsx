import Link from "next/link";
import { CalendarDays, FolderHeart, LogOut, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { requireAdmin } from "../../../lib/auth";
import AdminTabs from "../AdminTabs";

type Profile = { id: string; email: string | null; role: "admin" | "customer"; created_at: string };
type ProjectSet = { id: string; user_id: string; title: string; created_at: string; project_set_items: { id: string }[] };

export default async function AdminUsersPage() {
  const { supabase, user } = await requireAdmin();
  const [{ data: profiles }, { data: sets }] = await Promise.all([
    supabase.from("profiles").select("id,email,role,created_at").order("created_at", { ascending: false }),
    supabase.from("project_sets").select("id,user_id,title,created_at,project_set_items(id)").order("created_at", { ascending: false }),
  ]);
  const users = (profiles ?? []) as Profile[];
  const projectSets = (sets ?? []) as ProjectSet[];
  const customerCount = users.filter((profile) => profile.role === "customer").length;

  async function signOut() {
    "use server";
    const { supabase: adminSupabase } = await requireAdmin();
    await adminSupabase.auth.signOut();
    redirect("/");
  }

  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white">R</span>RENT4SET <span className="font-normal text-slate-400">/ Admin</span></Link><div className="flex items-center gap-2"><span className="hidden text-xs text-slate-500 sm:block">{user.email}</span><form action={signOut}><Button variant="ghost" size="sm"><LogOut size={14} />Sign out</Button></form></div></div></header><AdminTabs active="users" /><section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10"><div className="mb-8"><p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Customer management</p><h1 className="text-3xl font-semibold tracking-tight">Users and project sets</h1><p className="mt-2 text-sm text-slate-500">Review customer accounts and the equipment sets they are preparing.</p></div><div className="mb-8 grid gap-3 sm:grid-cols-3"><Stat icon={<Users size={16} />} label="All users" value={users.length} /><Stat icon={<Users size={16} />} label="Customers" value={customerCount} /><Stat icon={<FolderHeart size={16} />} label="Project sets" value={projectSets.length} /></div><section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="text-base font-semibold">User activity</h2><p className="mt-1 text-sm text-slate-500">Sets and saved-item totals by account</p></div>{users.length ? users.map((profile) => { const userSets = projectSets.filter((set) => set.user_id === profile.id); const itemCount = userSets.reduce((total, set) => total + (set.project_set_items?.length ?? 0), 0); return <article key={profile.id} className="border-b border-slate-200 p-5 last:border-b-0"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{profile.email ?? "Unknown user"}</h3><span className={profile.role === "admin" ? "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600" : "rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"}>{profile.role}</span></div><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={13} />Joined {new Date(profile.created_at).toLocaleDateString()}</p></div><div className="flex gap-4 text-sm"><span><strong className="block text-base">{userSets.length}</strong><span className="text-slate-500">sets</span></span><span><strong className="block text-base">{itemCount}</strong><span className="text-slate-500">saved items</span></span></div></div>{userSets.length ? <div className="mt-4 divide-y divide-slate-100 rounded-md border border-slate-200"><div className="grid grid-cols-[1fr_auto_auto] gap-4 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500"><span>Project set</span><span>Items</span><span>Created</span></div>{userSets.map((set) => <div key={set.id} className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-3 text-sm"><span className="truncate font-medium">{set.title}</span><span className="text-slate-500">{set.project_set_items?.length ?? 0}</span><span className="text-slate-500">{new Date(set.created_at).toLocaleDateString()}</span></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No project sets created yet.</p>}</article>; }) : <div className="grid place-items-center px-5 py-14 text-sm text-slate-500">No user profiles found. Run the admin user visibility migration first.</div>}</section></section></main>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><span className="flex items-center gap-1.5 text-xs text-slate-500">{icon}{label}</span><strong className="mt-3 block text-2xl font-semibold tracking-tight">{value}</strong></div>;
}
