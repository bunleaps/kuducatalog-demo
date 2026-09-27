"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { createClient } from "../../lib/supabase/client";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function login(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const supabase = createClient();
    if (!supabase) { setError("Supabase is not configured yet."); setLoading(false); return; }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError(signInError.message); setLoading(false); return; }
    router.push("/account"); router.refresh();
  }
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-4"><div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-7 shadow-sm"><Link href="/" className="mb-10 flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs text-white">R</span>RENT4SET</Link><p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Your account</p><h1 className="text-2xl font-semibold tracking-tight">Sign in</h1><p className="mt-2 text-sm text-slate-500">Continue managing your project sets.</p><form className="mt-7 grid gap-4" onSubmit={login}><label className="grid gap-2 text-sm font-medium text-slate-700">Email<Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="grid gap-2 text-sm font-medium text-slate-700">Password<Input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<Button disabled={loading}><LogIn size={15} />{loading ? "Signing in…" : "Sign in"}</Button></form><div className="mt-6 flex items-center justify-between text-sm"><Link href="/register" className="text-slate-500 hover:text-slate-950">Create an account</Link><Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-950"><ArrowLeft size={15} />Catalog</Link></div></div></main>;
}
