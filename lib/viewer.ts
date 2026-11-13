import { createClient } from "./supabase/server";

export async function getViewer() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!supabase || !user) return { supabase, user: null, role: undefined, quoteCount: 0, favoriteCount: 0 } as const;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role as "admin" | "customer" | undefined;
  const [{ data: activeCart }, { count: favoriteCount }] = role === "customer" ? await Promise.all([
    supabase.from("project_sets").select("project_set_items(quantity)").eq("is_active", true).maybeSingle(),
    supabase.from("favorites").select("catalog_item_id", { count: "exact", head: true }),
  ]) : [{ data: null }, { count: 0 }];
  const cartItems = (activeCart?.project_set_items ?? []) as { quantity: number }[];
  const quoteCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  return { supabase, user, role, quoteCount, favoriteCount: favoriteCount ?? 0 };
}
