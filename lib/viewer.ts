import { createClient } from "./supabase/server";

export async function getViewer() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!supabase || !user) return { supabase, user: null, role: undefined, quoteCount: 0, favoriteCount: 0 } as const;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role as "admin" | "customer" | undefined;
  const [{ count: quoteCount }, { count: favoriteCount }] = role === "customer" ? await Promise.all([
    supabase.from("project_sets").select("id", { count: "exact", head: true }),
    supabase.from("favorites").select("catalog_item_id", { count: "exact", head: true }),
  ]) : [{ count: 0 }, { count: 0 }];
  return { supabase, user, role, quoteCount: quoteCount ?? 0, favoriteCount: favoriteCount ?? 0 };
}
