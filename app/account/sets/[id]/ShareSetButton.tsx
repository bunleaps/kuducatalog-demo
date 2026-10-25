"use client";

import { Check, Clipboard, Link2, RefreshCw, Share2, ShieldCheck, Unlink, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { createClient } from "../../../../lib/supabase/client";

type ShareRecord = { token: string; created_at: string; revoked_at: string | null };

export default function ShareSetButton({ projectSetId }: { projectSetId: string }) {
  const [open, setOpen] = useState(false);
  const [share, setShare] = useState<ShareRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const active = Boolean(share && !share.revoked_at);
  const shareUrl = active && typeof window !== "undefined" ? `${window.location.origin}/share/${share!.token}` : "";

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  async function loadShare() {
    const supabase = createClient(); if (!supabase) return;
    setLoading(true); setError("");
    const { data, error: loadError } = await supabase.from("project_set_shares").select("token,created_at,revoked_at").eq("project_set_id", projectSetId).maybeSingle();
    if (loadError) setError(loadError.message.includes("project_set_shares") ? "Sharing is not set up yet. Run the secure set sharing migration in Supabase." : loadError.message);
    else setShare(data as ShareRecord | null);
    setLoading(false);
  }

  function openDialog() { setOpen(true); setCopied(false); void loadShare(); }

  async function generateLink() {
    const supabase = createClient(); if (!supabase) return;
    setLoading(true); setError(""); setCopied(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Your session has expired. Please sign in again."); setLoading(false); return; }
    const result = share
      ? await supabase.from("project_set_shares").update({ token: crypto.randomUUID(), revoked_at: null, created_at: new Date().toISOString() }).eq("project_set_id", projectSetId).select("token,created_at,revoked_at").single()
      : await supabase.from("project_set_shares").insert({ project_set_id: projectSetId, owner_id: user.id }).select("token,created_at,revoked_at").single();
    if (result.error) setError(result.error.message);
    else setShare(result.data as ShareRecord);
    setLoading(false);
  }

  async function revokeLink() {
    if (!confirm("Disable this share link? Anyone using it will no longer be able to view the set.")) return;
    const supabase = createClient(); if (!supabase) return;
    setLoading(true); setError(""); setCopied(false);
    const revokedAt = new Date().toISOString();
    const { error: revokeError } = await supabase.from("project_set_shares").update({ revoked_at: revokedAt }).eq("project_set_id", projectSetId);
    if (revokeError) setError(revokeError.message);
    else setShare((current) => current ? { ...current, revoked_at: revokedAt } : current);
    setLoading(false);
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); window.setTimeout(() => setCopied(false), 2500); }
    catch { setError("Unable to copy automatically. Select the link and copy it manually."); }
  }

  return <>
    <Button variant="outline" onClick={openDialog}><Share2 size={15} />Share</Button>
    {open && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="share-dialog-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="w-full max-w-md rounded-t-xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Project sharing</p><h2 id="share-dialog-title" className="mt-1 text-xl font-semibold">Share this set</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Anyone with an active link can view this equipment list.</p></div><Button variant="ghost" size="sm" className="size-9 shrink-0 px-0" onClick={() => setOpen(false)} aria-label="Close sharing"><X size={18} /></Button></div>

        <div className="mt-5">
          {loading && !share ? <div className="grid place-items-center rounded-lg border border-dashed border-slate-200 py-10 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Loading sharing settings…</div> : active ? <div className="grid gap-4"><div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/40"><p className="flex items-center gap-2 text-sm font-medium text-green-800 dark:text-green-300"><ShieldCheck size={16} />Share link is active</p><p className="mt-1 text-xs text-green-700 dark:text-green-400">Created {new Date(share!.created_at).toLocaleDateString()}</p></div><div className="flex gap-2"><Input readOnly value={shareUrl} aria-label="Shareable link" onFocus={(event) => event.target.select()} /><Button className="shrink-0" onClick={copyLink}>{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? "Copied" : "Copy"}</Button></div><Button variant="outline" className="justify-self-start text-red-700 dark:text-red-300" onClick={revokeLink} disabled={loading}><Unlink size={15} />{loading ? "Disabling…" : "Disable link"}</Button></div> : <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center dark:border-slate-700"><Link2 size={22} className="mx-auto text-slate-400 dark:text-slate-500" /><h3 className="mt-3 text-sm font-semibold">This set is private</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Generate a secure, read-only link when you want to share it.</p><Button className="mt-4" onClick={generateLink} disabled={loading}>{share ? <RefreshCw size={15} /> : <Share2 size={15} />}{loading ? "Generating…" : share ? "Generate new link" : "Generate share link"}</Button></div>}
          {error && <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        </div>
      </div>
    </div>}
  </>;
}
