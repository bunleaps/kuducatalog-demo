import { notFound, redirect } from "next/navigation";
import RentalFooter from "../../../../../components/RentalFooter";
import RentalHeader from "../../../../../components/RentalHeader";
import { createClient } from "../../../../../lib/supabase/server";
import RequestQuoteForm from "./RequestQuoteForm";

type CatalogItem = { title: string; category: string; availability: string };
type SetItem = { id: string; quantity: number; catalog_items: CatalogItem | CatalogItem[] | null };

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient(); if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const { id } = await params;
  const [{ data }, { count }, { count: favoriteCount }] = await Promise.all([
    supabase.from("project_sets").select("*,project_set_items(id,quantity,catalog_items(title,category,availability))").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("project_sets").select("id", { count: "exact", head: true }),
    supabase.from("favorites").select("catalog_item_id", { count: "exact", head: true }),
  ]);
  if (!data) notFound();
  const rows = (data.project_set_items ?? []) as unknown as SetItem[];
  const items = rows.flatMap((row) => { const item = Array.isArray(row.catalog_items) ? row.catalog_items[0] : row.catalog_items; return item ? [{ id: row.id, title: item.title, category: item.category, availability: item.availability, quantity: row.quantity }] : []; });
  if (!items.length) redirect(`/account/sets/${id}`);
  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white"><RentalHeader role="customer" quoteCount={count ?? 0} favoriteCount={favoriteCount ?? 0} /><RequestQuoteForm projectSet={{ id: data.id, title: data.title, collection_date: data.collection_date ?? "", return_date: data.return_date ?? "", collection_time: data.collection_time ?? "", return_time: data.return_time ?? "", fulfillment: data.fulfillment ?? "self_pickup", contact_name: data.contact_name ?? "", shoot_location: data.shoot_location ?? "", production_type: data.production_type ?? "", request_notes: data.request_notes ?? "" }} email={user.email ?? ""} items={items} /><RentalFooter /></main>;
}
