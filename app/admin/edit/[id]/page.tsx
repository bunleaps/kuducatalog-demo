import { notFound, redirect } from "next/navigation";
import AdminItemForm from "../../AdminItemForm";
import { createClient } from "../../../../lib/supabase/server";

export default async function EditAdminItemPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!supabase) return <AdminItemForm />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { id } = await params;
  const { data } = await supabase.from("catalog_items").select("*").eq("id", id).single();
  if (!data) notFound();
  return <AdminItemForm initialItem={data} />;
}
