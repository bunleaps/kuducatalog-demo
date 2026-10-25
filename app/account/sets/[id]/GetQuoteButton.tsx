"use client";

import { ArrowLeft, CalendarDays, Check, Clipboard, FileText, MapPin, MessageSquareText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";

type QuoteItem = { title: string; category: string; availability: string; quantity: number };

function localDateInputValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function formatDate(value: string) {
  if (!value) return "Not selected";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric" }).format(new Date(year, month - 1, day));
}

function formatTime(value: string) {
  if (!value) return "";
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hour, minute));
}

export default function GetQuoteButton({ projectTitle, customerEmail, items }: { projectTitle: string; customerEmail: string; items: QuoteItem[] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"details" | "message">("details");
  const [collectionDate, setCollectionDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [collectionTime, setCollectionTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const today = localDateInputValue();
  const dateError = collectionDate && returnDate && returnDate < collectionDate ? "Return date must be on or after the collection date." : "";
  const canCopy = Boolean(items.length && collectionDate && returnDate && !dateError);
  const unavailableItems = items.filter((item) => item.availability !== "available");

  const message = useMemo(() => {
    const collection = formatDate(collectionDate) + (collectionTime ? " at " + formatTime(collectionTime) : "");
    const returning = formatDate(returnDate) + (returnTime ? " at " + formatTime(returnTime) : "");
    const equipment = items.map((item, index) => `${index + 1}. ${item.title} — Quantity: ${item.quantity}${item.availability !== "available" ? ` (${item.availability})` : ""}`).join("\n");
    return [
      "Hi KUDU team,",
      "",
      "I would like to request a rental quote for the following project.",
      "",
      `Project: ${projectTitle}`,
      `Collection: ${collection}`,
      `Return: ${returning}`,
      location.trim() ? `Location: ${location.trim()}` : "",
      "",
      "Equipment:",
      equipment || "No equipment selected.",
      notes.trim() ? `\nAdditional notes:\n${notes.trim()}` : "",
      "",
      "Please confirm availability and send me a quotation.",
      "",
      `Customer account: ${customerEmail}`,
    ].filter((line, index, lines) => line !== "" || lines[index - 1] !== "").join("\n").trim();
  }, [collectionDate, collectionTime, customerEmail, items, location, notes, projectTitle, returnDate, returnTime]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [open]);

  async function copyMessage() {
    if (!canCopy) return;
    setCopyError("");
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(message);
      else {
        const element = document.createElement("textarea");
        element.value = message; element.style.position = "fixed"; element.style.opacity = "0";
        document.body.appendChild(element); element.select(); document.execCommand("copy"); element.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError("Unable to copy automatically. Select the message below and copy it manually.");
    }
  }

  function openDialog() { setStep("details"); setCopied(false); setCopyError(""); setOpen(true); }

  return <>
    <Button onClick={openDialog} disabled={!items.length}><MessageSquareText size={15} />Get a quote</Button>
    {open && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="quote-dialog-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-xl border border-slate-200 bg-white shadow-2xl sm:rounded-xl dark:border-slate-700 dark:bg-slate-900">
        <header className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800"><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Quote request · {step === "details" ? "Step 1 of 2" : "Step 2 of 2"}</p><h2 id="quote-dialog-title" className="mt-1 text-xl font-semibold">{step === "details" ? `Rental details for ${projectTitle}` : "Your message is ready"}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{step === "details" ? "Tell us when and where you need the equipment." : "Copy this message and send it using your preferred messaging app."}</p></div><Button variant="ghost" size="sm" className="size-9 shrink-0 px-0" onClick={() => setOpen(false)} aria-label="Close quote request"><X size={18} /></Button></header>

        <div className="overflow-y-auto p-5">
          {step === "details" ? <div className="grid gap-5">
            <section><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><CalendarDays size={16} />Rental period</h3><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">Collection date<Input type="date" required min={today} value={collectionDate} onChange={(event) => { setCollectionDate(event.target.value); if (returnDate && returnDate < event.target.value) setReturnDate(""); setCopied(false); }} /></label><label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">Return date<Input type="date" required min={collectionDate || today} value={returnDate} onChange={(event) => { setReturnDate(event.target.value); setCopied(false); }} /></label><label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">Collection time <span className="text-xs font-normal text-slate-400">Optional</span><Input type="time" value={collectionTime} onChange={(event) => { setCollectionTime(event.target.value); setCopied(false); }} /></label><label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">Return time <span className="text-xs font-normal text-slate-400">Optional</span><Input type="time" value={returnTime} onChange={(event) => { setReturnTime(event.target.value); setCopied(false); }} /></label></div>{dateError && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{dateError}</p>}</section>

            <section className="grid gap-3"><h3 className="flex items-center gap-2 text-sm font-semibold"><MapPin size={16} />Project details</h3><label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">Shoot or project location <span className="text-xs font-normal text-slate-400">Optional</span><Input value={location} maxLength={160} onChange={(event) => { setLocation(event.target.value); setCopied(false); }} placeholder="e.g. Phnom Penh" /></label><label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">Additional notes <span className="text-xs font-normal text-slate-400">Optional</span><Textarea value={notes} maxLength={1000} rows={3} onChange={(event) => { setNotes(event.target.value); setCopied(false); }} placeholder="Add production details, special requirements, or questions…" /></label></section>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your information is only used to generate the message and is not saved.</p>
          </div> : <div className="grid gap-5">
            <section><div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-semibold"><FileText size={16} />Message preview</h3><span className="text-xs text-slate-500 dark:text-slate-400">{items.length} {items.length === 1 ? "item" : "items"}</span></div>{unavailableItems.length > 0 && <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">{unavailableItems.length} {unavailableItems.length === 1 ? "item is" : "items are"} not currently marked available. The KUDU team will need to confirm availability.</div>}<Textarea readOnly value={message} rows={14} className="resize-none font-mono text-xs leading-relaxed" aria-label="Generated quote request message" /></section>

            <p className="text-xs text-slate-500 dark:text-slate-400">This is a quote request only. Equipment is not reserved until the KUDU team confirms availability and rental details.</p>
            {copyError && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{copyError}</p>}
          </div>}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 p-5 sm:flex-row sm:justify-end dark:border-slate-800">{step === "details" ? <><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setStep("message")} disabled={!canCopy}><MessageSquareText size={16} />Get quote</Button></> : <><Button variant="outline" onClick={() => { setStep("details"); setCopied(false); setCopyError(""); }}><ArrowLeft size={16} />Back</Button><Button onClick={copyMessage}>{copied ? <><Check size={16} />Copied</> : <><Clipboard size={16} />Copy message</>}</Button></>}</footer>
      </div>
    </div>}
  </>;
}
