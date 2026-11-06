import { Users } from "lucide-react";
import AdminHeader from "../../../components/AdminHeader";
import RentalFooter from "../../../components/RentalFooter";
import { requireAdmin } from "../../../lib/auth";
import AdminTabs from "../AdminTabs";
import AdminUserSets, { type AdminProjectSet } from "./AdminUserSets";

type Profile = { id: string; email: string | null; display_name: string | null; role: "admin" | "customer"; created_at: string };

export default async function AdminUsersPage() {
  const { supabase } = await requireAdmin();
  const [{ data: profiles }, { data: sets }] = await Promise.all([
    supabase.from("profiles").select("id,email,display_name,role,created_at").order("created_at", { ascending: false }),
    supabase.from("project_sets").select("id,user_id,title,created_at,project_set_items(id,quantity,catalog_items(id,title,category,availability,featured_media,media))").order("created_at", { ascending: false }),
  ]);
  const users = (profiles ?? []) as Profile[];
  const projectSets = (sets ?? []) as unknown as AdminProjectSet[];
  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white"><AdminHeader /><AdminTabs active="users" /><section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14"><div className="mb-9 border-b border-slate-200 pb-7 dark:border-[#303034]"><p className="flex items-center gap-2 text-xs font-bold uppercase text-[#f54449]"><Users size={14} />Customer activity</p><h1 className="mt-3 text-4xl font-black">Users and quote lists</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-[#929299]">Review customer accounts and preview the equipment lists they are preparing.</p></div><AdminUserSets users={users} projectSets={projectSets} /></section><RentalFooter /></main>;
}
