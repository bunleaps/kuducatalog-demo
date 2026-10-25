import Link from "next/link";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { requireAdmin } from "../../../lib/auth";
import AdminTabs from "../AdminTabs";
import CategoryManager, { type Category } from "./CategoryManager";
import ThemeToggle from "../../../components/ThemeToggle";

export default async function AdminCategoriesPage() {
  const { supabase, user } = await requireAdmin();
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("categories").select("id,name").order("name"),
    supabase.from("catalog_items").select("category_id"),
  ]);
  const categoryRows: Category[] = (categories ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    itemCount: (items ?? []).filter((item) => item.category_id === category.id).length,
  }));

  async function signOut() {
    "use server";
    const { supabase: adminSupabase } = await requireAdmin();
    await adminSupabase.auth.signOut();
    redirect("/");
  }

  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50"><header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white dark:bg-slate-100 dark:text-slate-950">R</span>RENT4SET <span className="font-normal text-slate-400 dark:text-slate-500">/ Admin</span></Link><div className="flex items-center gap-1"><span className="hidden text-xs text-slate-500 lg:block dark:text-slate-400">{user.email}</span><ThemeToggle /><form action={signOut}><Button variant="ghost" size="sm"><LogOut size={14} /><span className="hidden sm:inline">Sign out</span></Button></form></div></div></header><AdminTabs active="categories" /><section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10"><div className="mb-8"><p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Catalog organization</p><h1 className="text-3xl font-semibold tracking-tight">Categories</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Create the approved category options used by catalog items and public filters.</p></div><CategoryManager initialCategories={categoryRows} /></section></main>;
}
