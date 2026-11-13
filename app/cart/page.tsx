import { redirect } from "next/navigation";
import HomeHeader from "../../components/HomeHeader";
import RentalFooter from "../../components/RentalFooter";
import { getPublicCatalog } from "../../lib/catalog";
import { getViewer } from "../../lib/viewer";
import CartPageClient from "./CartPageClient";

export default async function CartPage() {
  const [viewer, { items }] = await Promise.all([getViewer(), getPublicCatalog()]);
  if (viewer.role === "admin") redirect("/admin");

  const { data: activeCart } = viewer.role === "customer"
    ? await viewer.supabase!.from("project_sets").select("id").eq("is_active", true).maybeSingle()
    : { data: null };

  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#101011] dark:text-white">
    <HomeHeader role={viewer.role} quoteCount={viewer.quoteCount} favoriteCount={viewer.favoriteCount} />
    <CartPageClient items={items} userId={viewer.user?.id} activeSetId={activeCart?.id ?? null} />
    <RentalFooter />
  </main>;
}
