"use client";

import Link from "next/link";
import { Check, Heart, MessageCircle, Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { addItemToCart, getGuestCartIds, getGuestCartQuantities, loadActiveCart } from "../../../lib/cart-client";
import { contactLinks } from "../../../lib/contact";
import { createClient } from "../../../lib/supabase/client";

const availabilityLabel = (value: string) => value === "available" ? "Available" : value === "limited" ? "Limited availability" : "Unavailable";

export default function EquipmentDetailActions({ itemId, userId, availability }: { itemId: string; userId?: string; availability: string }) {
  const [favorite, setFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => {
        setInCart(getGuestCartIds().includes(itemId));
        setQuantity(getGuestCartQuantities()[itemId] ?? 1);
      });
      return;
    }
    const supabase = createClient(); if (!supabase) return;
    Promise.all([
      supabase.from("favorites").select("catalog_item_id").eq("catalog_item_id", itemId).maybeSingle(),
      loadActiveCart(supabase),
    ]).then(([favoriteResult, cart]) => {
      setFavorite(Boolean(favoriteResult.data));
      setInCart(cart.itemIds.has(itemId));
      setQuantity(cart.itemQuantities.get(itemId) ?? 1);
    }).catch(() => undefined);
  }, [itemId, userId]);

  async function toggleFavorite() {
    if (!userId) return;
    const supabase = createClient(); if (!supabase) return;
    setBusy("favorite"); setError("");
    const { error: favoriteError } = favorite ? await supabase.from("favorites").delete().eq("catalog_item_id", itemId) : await supabase.from("favorites").insert({ user_id: userId, catalog_item_id: itemId });
    if (!favoriteError) setFavorite((value) => !value); else setError(favoriteError.message);
    setBusy("");
  }

  async function add() {
    if (availability === "unavailable") return;
    setBusy("cart"); setError("");
    try {
      await addItemToCart(itemId, userId, quantity);
      setInCart(true);
    } catch (cartError) {
      setError(cartError instanceof Error ? cartError.message : "Unable to update the cart.");
    } finally {
      setBusy("");
    }
  }

  const contactHref = contactLinks.whatsapp || "/#contact";
  const loginHref = "/login?next=" + encodeURIComponent(`/catalog/${itemId}`);
  return <div className="mt-6">
    <div className="group absolute right-0 top-0 z-10">{userId ? <button type="button" disabled={busy === "favorite"} onClick={toggleFavorite} className={`grid size-10 place-items-center border transition disabled:opacity-50 ${favorite ? "border-[#f54449] bg-[#f54449] text-white" : "border-slate-300 text-slate-500 hover:border-[#f54449] hover:text-[#f54449] dark:border-[#3a3a3e] dark:text-[#aaaab1]"}`} aria-label={favorite ? "Remove from favorites" : "Add to favorites"}><Heart size={18} fill={favorite ? "currentColor" : "none"} /></button> : <Link href={loginHref} className="grid size-10 place-items-center border border-slate-300 text-slate-500 transition hover:border-[#f54449] hover:text-[#f54449] dark:border-[#3a3a3e] dark:text-[#aaaab1]" aria-label="Sign in to favorite"><Heart size={18} /></Link>}<span role="tooltip" className="pointer-events-none absolute right-0 top-full mt-2 w-max max-w-48 translate-y-1 border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase text-slate-700 opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:border-[#343438] dark:bg-[#1a1a1d] dark:text-white">{userId ? favorite ? "Remove from favorites" : "Add to favorites" : "Sign in to favorite"}</span></div>
    <div className="grid border border-slate-200 bg-white dark:border-[#343438] dark:bg-[#1a1a1d] sm:grid-cols-2">
      <div className="border-b border-slate-200 p-4 dark:border-[#343438] sm:border-r"><p className="text-[10px] font-bold uppercase text-slate-500">Availability</p><p className={`mt-2 text-sm font-bold ${availability === "available" ? "text-emerald-600 dark:text-emerald-400" : availability === "limited" ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>{availabilityLabel(availability)}</p></div>
      <div className="border-b border-slate-200 p-4 dark:border-[#343438]"><p className="text-[10px] font-bold uppercase text-slate-500">Quantity</p><div className="mt-2 flex h-9 w-fit items-center border border-slate-300 dark:border-[#4a4a4e]"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} className="grid h-full w-9 place-items-center disabled:opacity-30" aria-label="Decrease quantity"><Minus size={14} /></button><span className="w-9 text-center text-sm font-bold">{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(99, value + 1))} disabled={quantity >= 99} className="grid h-full w-9 place-items-center disabled:opacity-30" aria-label="Increase quantity"><Plus size={14} /></button></div></div>
      <div className="p-4 sm:border-r sm:border-slate-200 sm:dark:border-[#343438]"><Button className="w-full" size="lg" disabled={availability === "unavailable" || busy === "cart"} onClick={add}>{inCart ? <Check size={16} /> : <ShoppingCart size={16} />}{availability === "unavailable" ? "Unavailable" : busy === "cart" ? "Updating…" : inCart ? "Update cart quantity" : "Add to cart"}</Button></div>
      <div className="border-t border-slate-200 p-4 dark:border-[#343438] sm:border-t-0"><Button asChild variant="outline" className="w-full" size="lg"><a href={contactHref} target={contactLinks.whatsapp ? "_blank" : undefined} rel={contactLinks.whatsapp ? "noreferrer" : undefined}><MessageCircle size={16} />Call for support</a></Button></div>
    </div>
    {inCart && <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"><Check size={15} />This item is already in your cart. Change the quantity and update it anytime.</p>}
    {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>;
}
