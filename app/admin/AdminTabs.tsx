import Link from "next/link";
import { Boxes, Settings, Tags, Users } from "lucide-react";
import { cn } from "../../lib/utils";

export default function AdminTabs({ active }: { active: "catalog" | "categories" | "users" | "settings" }) {
  const tabClass = (selected: boolean) => cn("flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition", selected ? "border-slate-900 text-slate-950 dark:border-slate-100 dark:text-white" : "border-transparent text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white");
  return <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><nav className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6"><Link href="/admin" className={tabClass(active === "catalog")}><Boxes size={15} />Catalog</Link><Link href="/admin/categories" className={tabClass(active === "categories")}><Tags size={15} />Categories</Link><Link href="/admin/users" className={tabClass(active === "users")}><Users size={15} />Users</Link><Link href="/admin/settings" className={tabClass(active === "settings")}><Settings size={15} />Settings</Link></nav></div>;
}
