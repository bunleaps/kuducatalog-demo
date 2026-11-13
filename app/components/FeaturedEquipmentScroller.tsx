"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { addItemToCart, getGuestCartIds, loadActiveCart } from "../../lib/cart-client";
import type { CatalogItem } from "../../lib/catalog";
import { createClient } from "../../lib/supabase/client";
import HomeEquipmentCard from "./HomeEquipmentCard";

export default function FeaturedEquipmentScroller({ items, userId, allowQuote }: { items: CatalogItem[]; userId?: string; allowQuote: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const resumeAt = useRef(0);
  const [cartItemIds, setCartItemIds] = useState<Set<string>>(new Set());
  const [addingItemId, setAddingItemId] = useState<string | null>(null);

  function pauseTemporarily(duration = 6000) {
    resumeAt.current = Date.now() + duration;
  }

  function move(direction: -1 | 1) {
    const element = scroller.current;
    if (!element) return;
    pauseTemporarily();
    element.scrollBy({ left: direction * Math.max(320, element.clientWidth * 0.85), behavior: "smooth" });
  }

  useEffect(() => {
    if (items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      const element = scroller.current;
      if (!element || document.hidden || isPaused.current || Date.now() < resumeAt.current) return;

      const firstCard = element.firstElementChild?.firstElementChild as HTMLElement | null;
      const gap = Number.parseFloat(window.getComputedStyle(element.firstElementChild as Element).columnGap) || 16;
      const step = firstCard ? firstCard.offsetWidth + gap : Math.max(320, element.clientWidth * 0.85);
      const maxScroll = element.scrollWidth - element.clientWidth;
      const nextPosition = element.scrollLeft + step;

      element.scrollTo({
        left: nextPosition >= maxScroll - 8 ? 0 : nextPosition,
        behavior: "smooth",
      });
    }, 3500);

    return () => window.clearInterval(interval);
  }, [items.length]);

  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => setCartItemIds(new Set(getGuestCartIds())));
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    loadActiveCart(supabase).then((cart) => setCartItemIds(cart.itemIds)).catch(() => undefined);
  }, [userId]);

  async function add(itemId: string) {
    if (cartItemIds.has(itemId)) return;
    setAddingItemId(itemId);
    try {
      await addItemToCart(itemId, userId);
      setCartItemIds((current) => new Set(current).add(itemId));
    } catch {
      return;
    } finally {
      setAddingItemId(null);
    }
  }

  return <div>
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase text-[#f54449]">Equipment catalog</p>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">Ready for your next shoot</h2>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link href="/catalog" className="mr-2 hidden items-center gap-2 text-xs font-bold uppercase hover:text-[#f54449] sm:flex">View all gear <ArrowRight size={14} /></Link>
        <button type="button" onClick={() => move(-1)} aria-label="Show previous equipment" className="grid size-10 place-items-center border border-slate-300 bg-white transition hover:border-[#f54449] hover:bg-[#f54449] hover:text-white dark:border-[#3a3a3e] dark:bg-[#1a1a1d]"><ChevronLeft size={18} /></button>
        <button type="button" onClick={() => move(1)} aria-label="Show more equipment" className="grid size-10 place-items-center border border-slate-300 bg-white transition hover:border-[#f54449] hover:bg-[#f54449] hover:text-white dark:border-[#3a3a3e] dark:bg-[#1a1a1d]"><ChevronRight size={18} /></button>
      </div>
    </div>
    {items.length ? <div
      ref={scroller}
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; pauseTemporarily(1500); }}
      onFocusCapture={() => { isPaused.current = true; }}
      onBlurCapture={() => { isPaused.current = false; pauseTemporarily(1500); }}
      onTouchStart={() => { isPaused.current = true; }}
      onTouchEnd={() => { isPaused.current = false; pauseTemporarily(); }}
      className="mt-5 snap-x snap-mandatory overflow-x-auto scroll-smooth pb-3 [scrollbar-color:#f54449_transparent] [scrollbar-width:thin]"
      aria-label="Featured equipment"
    >
      <div className="flex gap-4">
        {items.map((item) => <div key={item.id} className="w-[82vw] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]"><HomeEquipmentCard item={item} allowQuote={allowQuote} inCart={cartItemIds.has(item.id)} adding={addingItemId === item.id} onAdd={() => add(item.id)} /></div>)}
      </div>
    </div> : <div className="mt-5 border border-dashed border-slate-300 px-6 py-14 text-center text-sm text-slate-500 dark:border-[#3a3a3e] dark:text-[#929299]">Published equipment will appear here.</div>}
  </div>;
}
