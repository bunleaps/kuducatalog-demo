import Link from "next/link";
import { Heart, LogIn, MessageCircle, ShoppingCart, UserRound } from "lucide-react";
import RentalBrand from "./RentalBrand";

export default function HomeHeader({ role, quoteCount = 0, favoriteCount = 0 }: { role?: "admin" | "customer"; quoteCount?: number; favoriteCount?: number }) {
  const cartHref = role === "customer" ? "/account" : role === "admin" ? "/admin" : "/login";
  const favoriteHref = role === "customer" ? "/account/favorites" : role === "admin" ? "/admin" : "/login";
  const accountHref = role === "customer" ? "/account" : role === "admin" ? "/admin" : "/login";
  const accountLabel = role === "customer" ? "Account" : role === "admin" ? "Admin" : "Login";

  return <header className="relative z-40 border-b border-white/10 bg-[#0d0d0e] text-white">
    <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6">
      <RentalBrand inverted />
      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Customer navigation">
        <Link href={cartHref} className="relative grid size-10 place-items-center text-white/75 transition hover:bg-white/10 hover:text-white" aria-label={`Quote cart with ${quoteCount} lists`}>
          <ShoppingCart size={19} />
          {quoteCount > 0 && <span className="absolute right-0 top-0 grid min-w-4 rounded-full bg-[#f54449] px-1 text-center text-[9px] font-bold leading-4 text-white">{quoteCount > 9 ? "9+" : quoteCount}</span>}
        </Link>
        <Link href={favoriteHref} className="relative grid size-10 place-items-center text-white/75 transition hover:bg-white/10 hover:text-white" aria-label={`Favorites with ${favoriteCount} items`}>
          <Heart size={19} />
          {favoriteCount > 0 && <span className="absolute right-0 top-0 grid min-w-4 rounded-full bg-[#f54449] px-1 text-center text-[9px] font-bold leading-4 text-white">{favoriteCount > 9 ? "9+" : favoriteCount}</span>}
        </Link>
        <Link href={accountHref} className="hidden h-10 items-center gap-2 border border-white/25 px-4 text-xs font-bold uppercase transition hover:border-white hover:bg-white hover:text-slate-950 sm:inline-flex">
          {role ? <UserRound size={15} /> : <LogIn size={15} />}{accountLabel}
        </Link>
        <Link href="/#contact" className="inline-flex h-10 items-center gap-2 bg-[#f54449] px-3 text-xs font-bold uppercase text-white transition hover:bg-[#ff5a5f] sm:px-5">
          <MessageCircle size={15} /><span className="hidden sm:inline">Contact us</span><span className="sm:hidden">Contact</span>
        </Link>
      </nav>
    </div>
  </header>;
}
