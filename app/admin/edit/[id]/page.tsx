import { notFound } from "next/navigation";
import AdminItemForm from "../../AdminItemForm";
import { requireAdmin } from "../../../../lib/auth";

export default async function EditAdminItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const [{ data }, { data: categories }] = await Promise.all([
    supabase.from("catalog_items").select("*").eq("id", id).single(),
    supabase.from("categories").select("id,name").order("name"),
  ]);
  if (!data) notFound();
  return <AdminItemForm initialItem={data} categories={categories ?? []} />;
}
