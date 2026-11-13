import Link from "next/link";

export default function RentalBrand({ href = "/", inverted = false }: { href?: string; inverted?: boolean }) {
  return <Link href={href} className={`inline-flex items-baseline font-black tracking-tight ${inverted ? "text-white" : "text-slate-950 dark:text-white"}`}><span className="text-xl">RENT4SET</span></Link>;
}
