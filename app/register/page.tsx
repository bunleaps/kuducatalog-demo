"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { createClient } from "../../lib/supabase/client";
import AuthShell from "../../components/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function register(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    const supabase = createClient();
    if (!supabase) { setError("Supabase is not configured yet."); setLoading(false); return; }
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/account", data: { display_name: name.trim() } } });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    if (data.session) { router.push("/account"); router.refresh(); return; }
    setMessage("Check your email to confirm your account, then sign in."); setLoading(false);
  }
  return <AuthShell eyebrow="Client access" title="Create your account" description="Save equipment lists and prepare complete quote requests."><form className="mt-8 grid gap-5" onSubmit={register}><label className="grid gap-2 text-xs font-bold uppercase">Name<Input className="dark:border-slate-300 dark:bg-white dark:text-slate-950 dark:placeholder:text-slate-400" type="text" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label><label className="grid gap-2 text-xs font-bold uppercase">Email address<Input className="dark:border-slate-300 dark:bg-white dark:text-slate-950 dark:placeholder:text-slate-400" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@production.com" /></label><label className="grid gap-2 text-xs font-bold uppercase">Password<Input className="dark:border-slate-300 dark:bg-white dark:text-slate-950" type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /><span className="text-xs font-normal normal-case text-slate-500">At least 6 characters</span></label>{error && <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}{message && <p className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}<Button className="w-full" size="lg" disabled={loading}><UserPlus size={15} />{loading ? "Creating account…" : "Create client account"}</Button></form><div className="my-7 flex items-center gap-4 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-300" />OR<span className="h-px flex-1 bg-slate-300" /></div><Button asChild variant="outline" className="w-full dark:border-slate-400 dark:text-slate-950 dark:hover:bg-slate-100"><Link href="/login">Sign in instead</Link></Button><p className="mt-8 text-center text-sm text-slate-500">Want to explore first? <Link href="/catalog" className="font-medium text-[#f54449]">Browse the catalog</Link></p></AuthShell>;
}
