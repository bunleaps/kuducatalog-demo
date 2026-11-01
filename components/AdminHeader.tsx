"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import RentalBrand from "./RentalBrand";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { createClient } from "../lib/supabase/client";

export default function AdminHeader({ email }: { email?: string }) {
  const router = useRouter();
  async function signOut() { await createClient()?.auth.signOut(); router.push("/"); router.refresh(); }
  return <>
    <div className="border-b border-slate-200 bg-slate-100 text-slate-500 dark:border-[#262629] dark:bg-[#19191b] dark:text-[#a7a7ad]"><div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-[11px] sm:px-6"><span>RENT4SET administration</span><span className="hidden sm:inline">Catalog and customer quote management</span></div></div>
    <header className="border-b border-slate-200 bg-white text-slate-950 dark:border-[#2a2a2d] dark:bg-[#101011] dark:text-white"><div className="mx-auto flex h-17 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"><div className="flex items-center gap-3"><RentalBrand /><span className="border-l border-slate-300 pl-3 text-xs font-bold uppercase text-slate-500 dark:border-[#3a3a3e] dark:text-[#8f8f96]">Admin</span></div><div className="flex items-center gap-1"><span className="mr-2 hidden text-xs text-slate-500 lg:block dark:text-[#8f8f96]">{email}</span><ThemeToggle /><Button variant="ghost" size="sm" onClick={signOut}><LogOut size={14} /><span className="hidden sm:inline">Sign out</span></Button></div></div></header>
  </>;
}
