"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ThemeSettings from "./ThemeSettings";
import { createClient } from "../lib/supabase/client";

export default function AccountSettings({ email, displayName = "", role, backHref }: { email: string; displayName?: string; role: "admin" | "customer"; backHref: string }) {
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
  const panel = "border border-slate-200 bg-white p-6 dark:border-[#343438] dark:bg-[#1a1a1d]";

  return <div className="grid gap-5 lg:grid-cols-2">
    <section className={panel}>
      <div className="mb-7 flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center bg-[#27272b] text-[#f54449]"><UserRound size={18} /></span><div><p className="text-xs font-bold uppercase text-[#f54449]">Identity</p><h2 className="mt-1 text-lg font-black">Account details</h2><p className="mt-1 text-sm text-[#929299]">Your sign-in and access information.</p></div></div>
      <dl className="grid gap-5 text-sm"><div className="border-t border-slate-200 pt-4 dark:border-[#343438]"><dt className="text-[11px] font-bold uppercase text-slate-500 dark:text-[#77777f]">Name</dt><dd className="mt-2 font-bold text-slate-950 dark:text-white">{displayName || "Not provided"}</dd></div><div className="border-t border-slate-200 pt-4 dark:border-[#343438]"><dt className="text-[11px] font-bold uppercase text-slate-500 dark:text-[#77777f]">Email address</dt><dd className="mt-2 break-all font-bold text-slate-950 dark:text-white">{email}</dd></div><div className="border-t border-slate-200 pt-4 dark:border-[#343438]"><dt className="text-[11px] font-bold uppercase text-slate-500 dark:text-[#77777f]">Access level</dt><dd className="mt-2 flex items-center gap-2 font-bold capitalize text-slate-950 dark:text-white"><ShieldCheck size={15} className="text-[#f54449]" />{role}</dd></div></dl>
    </section>

    <section className={panel}>
      <p className="text-xs font-bold uppercase text-[#f54449]">Display</p><h2 className="mt-1 text-lg font-black">Appearance</h2><p className="mt-1 text-sm text-[#929299]">Choose how RENT4SET looks on this device.</p><div className="mt-7"><ThemeSettings /></div>
    </section>

    <section className={`${panel} lg:col-span-2`}>
      <div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center bg-[#27272b] text-[#f54449]"><KeyRound size={18} /></span><div><p className="text-xs font-bold uppercase text-[#f54449]">Security</p><h2 className="mt-1 text-lg font-black">Change password</h2><p className="mt-1 text-sm text-[#929299]">Use at least 6 characters for your new password.</p></div></div>
      <form className="mt-7 grid gap-5 md:grid-cols-2" onSubmit={updatePassword}><label className="grid gap-2 text-xs font-bold uppercase text-[#b4b4ba]">New password<Input type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} /></label><label className="grid gap-2 text-xs font-bold uppercase text-[#b4b4ba]">Confirm new password<Input type="password" minLength={6} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>{error && <p className="border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300 md:col-span-2">{error}</p>}{message && <p className="flex items-center gap-2 border border-emerald-900 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300 md:col-span-2"><CheckCircle2 size={15} />{message}</p>}<div className="md:col-span-2"><Button disabled={saving}>{saving ? "Updating…" : "Update password"}</Button></div></form>
    </section>

    <section className={`${panel} flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:col-span-2`}><div><p className="text-xs font-bold uppercase text-[#f54449]">Current session</p><h2 className="mt-1 text-lg font-black">Finished for now?</h2><p className="mt-1 text-sm text-[#929299]">Sign out securely from this browser.</p></div><Button variant="outline" onClick={signOut}><LogOut size={15} />Sign out</Button></section>
    <Button asChild variant="ghost" className="justify-self-start text-[#9a9aa1] lg:col-span-2"><Link href={backHref}><ArrowLeft size={15} />Back</Link></Button>
  </div>;
}
