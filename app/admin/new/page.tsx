import AdminItemForm from "../AdminItemForm";
import { requireAdmin } from "../../../lib/auth";

export default async function NewAdminItemPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase.from("categories").select("id,name").order("name");
  return <AdminItemForm categories={categories ?? []} />;
}
