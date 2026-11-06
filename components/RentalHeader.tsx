import HomeHeader from "./HomeHeader";

export default function RentalHeader({ role, quoteCount = 0, favoriteCount = 0 }: { role?: "admin" | "customer"; quoteCount?: number; favoriteCount?: number; compact?: boolean }) {
  return <HomeHeader role={role} quoteCount={quoteCount} favoriteCount={favoriteCount} />;
}
