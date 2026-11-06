import Link from "next/link";

export default function RentalBrand({ href = "/", inverted = false }: { href?: string; inverted?: boolean }) {
  return <Link href={href} className={`inline-flex items-baseline gap-2 font-black tracking-tight ${inverted ? "text-white" : "text-slate-950 dark:text-white"}`}><span className="text-xl">RENT4SET</span><span className="hidden text-[10px] font-bold uppercase tracking-normal text-[#f54449] sm:inline">By KUDU Studios</span></Link>;
}
