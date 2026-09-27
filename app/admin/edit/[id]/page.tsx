import { notFound } from "next/navigation";
import AdminItemForm from "../../AdminItemForm";
import { requireAdmin } from "../../../../lib/auth";

export default async function EditAdminItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { data } = await supabase.from("catalog_items").select("*").eq("id", id).single();
  if (!data) notFound();
  return <AdminItemForm initialItem={data} />;
}
