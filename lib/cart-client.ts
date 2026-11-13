import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";

export const guestCartStorageKey = "rent4set-guest-cart";
export const guestCartQuantityStorageKey = "rent4set-guest-cart-quantities";
export const cartUpdatedEvent = "rent4set-cart-updated";

type ActiveCartRow = {
  id: string;
  project_set_items: { catalog_item_id: string; quantity: number }[];
};

type AddCartResult = {
  project_set_id: string;
  item_count: number;
};

export function getGuestCartIds() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const value = JSON.parse(window.localStorage.getItem(guestCartStorageKey) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [] as string[];
  }
}

export function setGuestCartIds(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids));
  window.localStorage.setItem(guestCartStorageKey, JSON.stringify(uniqueIds));
  notifyCartUpdated(uniqueIds.length);
  return uniqueIds;
}

export function getGuestCartQuantities() {
  if (typeof window === "undefined") return {} as Record<string, number>;
  try {
    const value = JSON.parse(window.localStorage.getItem(guestCartQuantityStorageKey) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).flatMap(([id, quantity]) => typeof quantity === "number" && quantity >= 1 && quantity <= 99 ? [[id, quantity]] : []));
  } catch {
    return {} as Record<string, number>;
  }
}

export function clearGuestCart() {
  window.localStorage.removeItem(guestCartStorageKey);
  window.localStorage.removeItem(guestCartQuantityStorageKey);
  notifyCartUpdated(0);
}

export function notifyCartUpdated(count: number) {
  window.dispatchEvent(new CustomEvent(cartUpdatedEvent, { detail: { count } }));
}

export async function loadActiveCart(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("project_sets")
    .select("id,project_set_items(catalog_item_id,quantity)")
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  const cart = data as ActiveCartRow | null;
  const items = cart?.project_set_items ?? [];
  return {
    projectSetId: cart?.id ?? null,
    itemIds: new Set(items.map((item) => item.catalog_item_id)),
    itemQuantities: new Map(items.map((item) => [item.catalog_item_id, item.quantity])),
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
  };
}

export async function addItemToCart(itemId: string, userId?: string, quantity = 1) {
  if (!userId) {
    const ids = getGuestCartIds();
    const nextIds = ids.includes(itemId) ? ids : setGuestCartIds([...ids, itemId]);
    const quantities = getGuestCartQuantities();
    window.localStorage.setItem(guestCartQuantityStorageKey, JSON.stringify({ ...quantities, [itemId]: quantity }));
    if (nextIds === ids) notifyCartUpdated(ids.length);
    return { projectSetId: null, itemCount: nextIds.length };
  }

  const supabase = createClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.rpc("add_item_to_active_cart", { p_catalog_item_id: itemId, p_quantity: quantity });
  if (error) throw error;
  const result = data as AddCartResult;
  notifyCartUpdated(result.item_count);
  return { projectSetId: result.project_set_id, itemCount: result.item_count };
}
