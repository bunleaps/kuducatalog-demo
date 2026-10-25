"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";
import ThemeToggle from "../../../components/ThemeToggle";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const supabase = createClient();
    if (!supabase) { setError("Supabase is not configured yet."); setLoading(false); return; }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError(signInError.message); setLoading(false); return; }
    router.push("/admin"); router.refresh();
  }
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-4 text-slate-950 dark:bg-slate-950 dark:text-slate-50"><div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-10 flex items-center justify-between"><Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white dark:bg-slate-100 dark:text-slate-950">R</span>RENT4SET</Link><ThemeToggle /></div><p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Private area</p><h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Welcome back</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in to manage the catalog.</p><form className="mt-7 grid gap-4" onSubmit={handleSubmit}><label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">Email<Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">Password<Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p>}<Button disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button></form><Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"><ArrowLeft size={15} />Back to catalog</Link></div></main>;
}
