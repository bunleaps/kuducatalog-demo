import Link from "next/link";

export default function RentalBrand({ href = "/" }: { href?: string }) {
  return <Link href={href} className="inline-flex items-baseline gap-2 font-black tracking-tight text-slate-950 dark:text-white"><span className="text-xl">RENT4SET</span><span className="text-[10px] font-bold uppercase tracking-normal text-[#f54449]">By KUDU Studios</span></Link>;
}
