import { createClient } from "./supabase/server";

export type CatalogItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  availability: "available" | "limited" | "unavailable";
  media: string[];
  featured_media: string | null;
  created_at: string;
};

export type CatalogResult = {
  items: CatalogItem[];
  setupError: boolean;
};

export async function getPublicCatalog() {
  const supabase = await createClient();
  if (!supabase) return { items: [], setupError: false } satisfies CatalogResult;

  const { data, error } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    // A missing table means the one-time Supabase schema has not been run yet.
    // Keep the public page usable while showing an actionable setup notice.
    const missingTable = error.code === "42P01" || error.message.includes("schema cache");
    if (missingTable) return { items: [], setupError: true } satisfies CatalogResult;
    console.error("Unable to load catalog", error.message);
    return { items: [], setupError: false } satisfies CatalogResult;
  }

  return { items: (data ?? []) as CatalogItem[], setupError: false } satisfies CatalogResult;
}
