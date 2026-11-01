import Link from "next/link";
import { Boxes, Settings, Tags, Users } from "lucide-react";
import { cn } from "../../lib/utils";

export default function AdminTabs({ active }: { active: "catalog" | "categories" | "users" | "settings" }) {
  const tabClass = (selected: boolean) => cn("flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-xs font-bold uppercase transition", selected ? "border-[#f54449] text-slate-950 dark:text-white" : "border-transparent text-slate-500 hover:text-slate-950 dark:text-[#85858c] dark:hover:text-white");
  return <div className="border-b border-slate-200 bg-slate-100 dark:border-[#2a2a2d] dark:bg-[#151517]"><nav className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6"><Link href="/admin" className={tabClass(active === "catalog")}><Boxes size={15} />Catalog</Link><Link href="/admin/categories" className={tabClass(active === "categories")}><Tags size={15} />Categories</Link><Link href="/admin/users" className={tabClass(active === "users")}><Users size={15} />Users</Link><Link href="/admin/settings" className={tabClass(active === "settings")}><Settings size={15} />Settings</Link></nav></div>;
}
