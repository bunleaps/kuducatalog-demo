import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import { createClient } from "../../lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) return <AdminDashboard initialItems={[]} userEmail="Not connected" />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data } = await supabase.from("catalog_items").select("*").order("created_at", { ascending: false });
  return <AdminDashboard initialItems={data ?? []} userEmail={user.email ?? "Admin"} />;
}
