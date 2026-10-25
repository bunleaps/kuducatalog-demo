"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ThemeSettings from "./ThemeSettings";
import { createClient } from "../lib/supabase/client";

export default function AccountSettings({ email, role, backHref }: { email: string; role: "admin" | "customer"; backHref: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function updatePassword(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (password.length < 6) { setError("Use at least 6 characters."); return; }
    if (password !== confirmation) { setError("The passwords do not match."); return; }
    const supabase = createClient(); if (!supabase) { setError("Supabase is not configured."); return; }
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    setPassword(""); setConfirmation(""); setMessage("Password updated successfully.");
  }

  async function signOut() { await createClient()?.auth.signOut(); router.push("/"); router.refresh(); }

  return <div className="grid gap-6">
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><UserRound size={17} /></span><div><h2 className="font-semibold">Account</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your sign-in details and access level.</p></div></div>
      <dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</dt><dd className="mt-1 break-all font-medium">{email}</dd></div><div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</dt><dd className="mt-1 flex items-center gap-1.5 font-medium capitalize"><ShieldCheck size={15} className="text-slate-400" />{role}</dd></div></dl>
    </section>

    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5"><h2 className="font-semibold">Appearance</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose how RENT4SET looks on this device.</p></div><ThemeSettings />
    </section>

    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><KeyRound size={17} /></span><div><h2 className="font-semibold">Change password</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use at least 6 characters for your new password.</p></div></div>
      <form className="grid gap-4" onSubmit={updatePassword}><label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">New password<Input type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /></label><label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">Confirm new password<Input type="password" minLength={6} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>{error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p>}{message && <p className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"><CheckCircle2 size={15} />{message}</p>}<Button className="justify-self-start" disabled={saving}>{saving ? "Updating…" : "Update password"}</Button></form>
    </section>

    <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"><div><h2 className="font-semibold">Session</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign out from this browser.</p></div><Button variant="outline" onClick={signOut}><LogOut size={15} />Sign out</Button></section>
    <Button asChild variant="ghost" className="justify-self-start"><Link href={backHref}><ArrowLeft size={15} />Back</Link></Button>
  </div>;
}
