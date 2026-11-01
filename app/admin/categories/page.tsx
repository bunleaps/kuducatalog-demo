import { Tags } from "lucide-react";
import AdminHeader from "../../../components/AdminHeader";
import RentalFooter from "../../../components/RentalFooter";
import { requireAdmin } from "../../../lib/auth";
import AdminTabs from "../AdminTabs";
import CategoryManager, { type Category } from "./CategoryManager";

export default async function AdminCategoriesPage() {
  const { supabase, user } = await requireAdmin();
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("categories").select("id,name").order("name"),
    supabase.from("catalog_items").select("category_id"),
  ]);
  const categoryRows: Category[] = (categories ?? []).map((category) => ({ id: category.id, name: category.name, itemCount: (items ?? []).filter((item) => item.category_id === category.id).length }));
  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white"><AdminHeader email={user.email} /><AdminTabs active="categories" /><section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14"><div className="mb-9 border-b border-slate-200 pb-7 dark:border-[#303034]"><p className="flex items-center gap-2 text-xs font-bold uppercase text-[#f54449]"><Tags size={14} />Catalog organization</p><h1 className="mt-3 text-4xl font-black">Equipment categories</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-[#929299]">Maintain one approved set of categories for equipment forms and customer filters.</p></div><CategoryManager initialCategories={categoryRows} /></section><RentalFooter /></main>;
}
