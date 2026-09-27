import Link from "next/link";
import { Boxes, Users } from "lucide-react";
import { cn } from "../../lib/utils";

export default function AdminTabs({ active }: { active: "catalog" | "users" }) {
  return <div className="border-b border-slate-200 bg-white"><nav className="mx-auto flex w-full max-w-5xl gap-1 px-4 sm:px-6"><Link href="/admin" className={cn("flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition", active === "catalog" ? "border-slate-900 text-slate-950" : "border-transparent text-slate-500 hover:text-slate-950")}><Boxes size={15} />Catalog</Link><Link href="/admin/users" className={cn("flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition", active === "users" ? "border-slate-900 text-slate-950" : "border-transparent text-slate-500 hover:text-slate-950")}><Users size={15} />Users</Link></nav></div>;
}
