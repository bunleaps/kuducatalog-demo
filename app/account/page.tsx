import { redirect } from "next/navigation";
import AccountDashboard from "./AccountDashboard";
import { createClient } from "../../lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "admin") redirect("/admin");
  const [{ data }, { count: favoriteCount }] = await Promise.all([
    supabase.from("project_sets").select("id,title,created_at,is_active,project_set_items(id,quantity)").order("created_at", { ascending: false }),
    supabase.from("favorites").select("catalog_item_id", { count: "exact", head: true }),
  ]);
  return <AccountDashboard email={user.email ?? ""} initialSets={(data ?? []) as { id: string; title: string; created_at: string; is_active: boolean; project_set_items: { id: string; quantity: number }[] }[]} favoriteCount={favoriteCount ?? 0} />;
}
