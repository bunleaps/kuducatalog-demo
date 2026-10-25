import Link from "next/link";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { requireAdmin } from "../../../lib/auth";
import AdminTabs from "../AdminTabs";
import AdminUserSets, { type AdminProjectSet } from "./AdminUserSets";
import ThemeToggle from "../../../components/ThemeToggle";

type Profile = { id: string; email: string | null; role: "admin" | "customer"; created_at: string };

export default async function AdminUsersPage() {
  const { supabase, user } = await requireAdmin();
  const [{ data: profiles }, { data: sets }] = await Promise.all([
    supabase.from("profiles").select("id,email,role,created_at").order("created_at", { ascending: false }),
    supabase.from("project_sets").select("id,user_id,title,created_at,project_set_items(id,quantity,catalog_items(id,title,category,availability,featured_media,media))").order("created_at", { ascending: false }),
  ]);
  const users = (profiles ?? []) as Profile[];
  const projectSets = (sets ?? []) as unknown as AdminProjectSet[];

  async function signOut() {
    "use server";
    const { supabase: adminSupabase } = await requireAdmin();
    await adminSupabase.auth.signOut();
    redirect("/");
  }

  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50"><header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white dark:bg-slate-100 dark:text-slate-950">R</span>RENT4SET <span className="font-normal text-slate-400 dark:text-slate-500">/ Admin</span></Link><div className="flex items-center gap-1"><span className="hidden text-xs text-slate-500 lg:block dark:text-slate-400">{user.email}</span><ThemeToggle /><form action={signOut}><Button variant="ghost" size="sm"><LogOut size={14} /><span className="hidden sm:inline">Sign out</span></Button></form></div></div></header><AdminTabs active="users" /><section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10"><div className="mb-8"><p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Customer management</p><h1 className="text-3xl font-semibold tracking-tight">Users and project sets</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Review customer accounts and preview the equipment they are preparing.</p></div><AdminUserSets users={users} projectSets={projectSets} /></section></main>;
}
