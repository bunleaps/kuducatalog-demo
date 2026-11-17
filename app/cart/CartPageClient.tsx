"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, PackageOpen, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { addItemToCart, clearGuestCart, getGuestCartIds, getGuestCartQuantities, guestCartQuantityStorageKey, guestCartStorageKey, notifyCartUpdated, setGuestCartIds } from "../../lib/cart-client";
import type { CatalogItem } from "../../lib/catalog";

export default function CartPageClient({ items, userId, activeSetId }: { items: CatalogItem[]; userId?: string; activeSetId: string | null }) {
  const router = useRouter();
  const [guestIds, setGuestIds] = useState<string[]>([]);
  const [guestQuantities, setGuestQuantities] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [destinationSetId, setDestinationSetId] = useState(activeSetId);
  const [syncAttempt, setSyncAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function prepareCart() {
      const storedIds = getGuestCartIds();
      const storedQuantities = getGuestCartQuantities();
      if (!userId) {
        queueMicrotask(() => { if (!cancelled) { setGuestIds(storedIds); setGuestQuantities(storedQuantities); setReady(true); } });
        return;
      }

      if (!storedIds.length) {
        if (activeSetId) router.replace(`/account/sets/${activeSetId}`);
        else queueMicrotask(() => { if (!cancelled) setReady(true); });
        return;
      }

      setSyncing(true);
      setReady(false);
      setSyncError("");
      const failedIds: string[] = [];
      let projectSetId = activeSetId;
      let serverItemCount: number | null = null;

      for (const itemId of storedIds) {
        try {
          const result = await addItemToCart(itemId, userId, storedQuantities[itemId] ?? 1);
          projectSetId = result.projectSetId ?? projectSetId;
          serverItemCount = result.itemCount;
        } catch {
          failedIds.push(itemId);
        }
      }

      if (cancelled) return;
      if (!failedIds.length) {
        clearGuestCart();
        if (projectSetId) router.replace(`/account/sets/${projectSetId}`);
        else { setReady(true); setSyncing(false); }
        return;
      }

      const failedQuantities = Object.fromEntries(failedIds.map((itemId) => [itemId, storedQuantities[itemId] ?? 1]));
      window.localStorage.setItem(guestCartStorageKey, JSON.stringify(failedIds));
      window.localStorage.setItem(guestCartQuantityStorageKey, JSON.stringify(failedQuantities));
      if (serverItemCount !== null) notifyCartUpdated(serverItemCount);
      setGuestIds(failedIds);
      setGuestQuantities(failedQuantities);
      setDestinationSetId(projectSetId);
      setSyncError("Some equipment could not be moved into your account cart. Its availability may have changed. Remove it or retry the transfer.");
      setReady(true);
      setSyncing(false);
    }

    void prepareCart();
    return () => { cancelled = true; };
  }, [activeSetId, router, syncAttempt, userId]);

  const guestItems = useMemo(() => guestIds.flatMap((id) => {
    const item = items.find((entry) => entry.id === id);
    return item ? [item] : [];
  }), [guestIds, items]);

  function remove(itemId: string) {
    const nextIds = guestIds.filter((id) => id !== itemId);
    const nextQuantities = { ...guestQuantities };
    delete nextQuantities[itemId];
    if (userId) window.localStorage.setItem(guestCartStorageKey, JSON.stringify(nextIds));
    else setGuestCartIds(nextIds);
    window.localStorage.setItem(guestCartQuantityStorageKey, JSON.stringify(nextQuantities));
    setGuestIds(nextIds);
    setGuestQuantities(nextQuantities);
  }

  if (!ready || syncing) return <section className="mx-auto grid min-h-[55vh] max-w-5xl place-items-center px-4 py-16 text-center sm:px-6"><div><ShoppingCart className="mx-auto text-[#f54449]" /><h1 className="mt-4 text-2xl font-black">Preparing your cart…</h1><p className="mt-2 text-sm text-slate-500 dark:text-[#929299]">Your selected equipment is being saved.</p></div></section>;

  return <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <p className="text-xs font-bold uppercase text-[#f54449]">Quote cart</p>
    <h1 className="mt-2 text-4xl font-black">{guestItems.length ? `${guestItems.length} selected ${guestItems.length === 1 ? "item" : "items"}` : "Your cart is empty"}</h1>
    <p className="mt-3 text-sm text-slate-500 dark:text-[#929299]">Add equipment now. You will name the project and enter production details before preparing the request.</p>

    {syncError && <p className="mt-6 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{syncError}</p>}
    {guestItems.length ? <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="border border-slate-200 bg-white dark:border-[#343438] dark:bg-[#1a1a1d]">{guestItems.map((item) => { const image = item.featured_media || item.media?.[0]; return <article key={item.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-slate-200 p-4 last:border-b-0 dark:border-[#303034]"><div className="size-16 overflow-hidden bg-slate-100 dark:bg-[#27272b]">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}</div><div className="min-w-0"><p className="text-[10px] font-bold uppercase text-[#f54449]">{item.category}</p><h2 className="mt-1 truncate font-bold">{item.title}</h2><p className="mt-1 text-xs text-slate-500">Quantity: {guestQuantities[item.id] ?? 1}</p></div><button onClick={() => remove(item.id)} className="grid size-9 place-items-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40" aria-label={`Remove ${item.title}`}><Trash2 size={16} /></button></article>; })}</div>
      {userId ? <aside className="h-fit bg-[#f4f3ef] p-6 text-slate-950"><h2 className="text-xl font-black">Finish the transfer</h2><p className="mt-3 text-sm leading-6 text-slate-500">Retry these remaining items after checking availability, or remove them and continue with the equipment already saved.</p><Button className="mt-6 w-full" size="lg" onClick={() => setSyncAttempt((attempt) => attempt + 1)}>Retry remaining items <ArrowRight size={16} /></Button>{destinationSetId && <Button asChild variant="outline" className="mt-3 w-full"><Link href={`/account/sets/${destinationSetId}`}>Open saved cart</Link></Button>}</aside> : <aside className="h-fit bg-[#f4f3ef] p-6 text-slate-950"><h2 className="text-xl font-black">Ready to continue?</h2><p className="mt-3 text-sm leading-6 text-slate-500">Sign in to save this cart, adjust quantities, and add the production details.</p><Button asChild className="mt-6 w-full" size="lg"><Link href="/login?next=/cart">Sign in to continue <ArrowRight size={16} /></Link></Button><p className="mt-3 text-center text-xs text-slate-500">Your cart will be kept on this device.</p></aside>}
    </div> : <div className="mt-8 grid place-items-center border border-dashed border-slate-300 px-5 py-16 text-center dark:border-[#3a3a3e]"><PackageOpen size={25} className="text-slate-400" /><h2 className="mt-4 font-bold">No equipment selected</h2><p className="mt-2 text-sm text-slate-500">Browse the catalog and use the cart icon to add equipment.</p><Button asChild variant="outline" className="mt-5"><Link href="/catalog">Browse equipment</Link></Button></div>}
  </section>;
}
