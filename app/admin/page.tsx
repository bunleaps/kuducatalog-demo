import AdminDashboard from "./AdminDashboard";
import { requireAdmin } from "../../lib/auth";

export default async function AdminPage() {
  const { supabase, user } = await requireAdmin();
  const { data } = await supabase.from("catalog_items").select("*").order("created_at", { ascending: false });
  return <AdminDashboard initialItems={data ?? []} userEmail={user.email ?? "Admin"} />;
}
