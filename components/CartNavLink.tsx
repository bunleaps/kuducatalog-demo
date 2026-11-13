"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { cartUpdatedEvent, getGuestCartIds, loadActiveCart } from "../lib/cart-client";
import { createClient } from "../lib/supabase/client";

export default function CartNavLink({ role, initialCount = 0 }: { role?: "admin" | "customer"; initialCount?: number }) {
  const [count, setCount] = useState(role === "admin" ? 0 : initialCount);
  const href = role === "admin" ? "/admin" : "/cart";

  useEffect(() => {
    let active = true;

    if (role === "customer") {
      const supabase = createClient();
      if (supabase) loadActiveCart(supabase).then((cart) => { if (active) setCount(cart.itemCount); }).catch(() => undefined);
    } else if (!role) {
      queueMicrotask(() => { if (active) setCount(getGuestCartIds().length); });
    }

    function update(event: Event) {
      const detail = (event as CustomEvent<{ count?: number }>).detail;
      if (typeof detail?.count === "number") setCount(detail.count);
    }

    function syncGuestCart() {
      if (!role) setCount(getGuestCartIds().length);
    }

    window.addEventListener(cartUpdatedEvent, update);
    window.addEventListener("storage", syncGuestCart);
    return () => {
      active = false;
      window.removeEventListener(cartUpdatedEvent, update);
      window.removeEventListener("storage", syncGuestCart);
    };
  }, [role]);

  return <Link href={href} className="relative grid size-10 place-items-center text-white/75 transition hover:bg-white/10 hover:text-white" aria-label={`Quote cart with ${count} items`}>
    <ShoppingCart size={19} />
    {count > 0 && <span className="absolute right-0 top-0 grid min-w-4 rounded-full bg-[#f54449] px-1 text-center text-[9px] font-bold leading-4 text-white">{count > 9 ? "9+" : count}</span>}
  </Link>;
}
