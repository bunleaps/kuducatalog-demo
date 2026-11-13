"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  name?: string;
  placeholder?: string;
  ariaLabel: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
};

export function Select({
  value,
  defaultValue = "",
  onValueChange,
  options,
  name,
  placeholder = "Select an option",
  ariaLabel,
  disabled = false,
  required = false,
  className,
  triggerClassName,
  menuClassName,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectedValue = value ?? internalValue;
  const selected = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function choose(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  }

  return <div ref={rootRef} className={cn("relative", className)}>
    {name && <input type="hidden" name={name} value={selectedValue} />}
    <button
      type="button"
      role="combobox"
      aria-label={ariaLabel}
      aria-controls={listId}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-required={required}
      disabled={disabled}
      onClick={() => setOpen((current) => !current)}
      onKeyDown={handleTriggerKeyDown}
      className={cn(
        "flex h-11 w-full items-center justify-between gap-3 border border-slate-300 bg-white px-4 text-left text-sm text-slate-950 outline-none transition hover:border-[#f54449] focus-visible:ring-2 focus-visible:ring-[#f54449] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#414146] dark:bg-[#111113] dark:text-white",
        triggerClassName,
      )}
    >
      <span className={cn("truncate", !selected && "text-slate-500 dark:text-[#929299]")}>{selected?.label ?? placeholder}</span>
      <ChevronDown size={14} className={cn("shrink-0 transition-transform", open && "rotate-180")} />
    </button>

    {open && <div id={listId} role="listbox" aria-label={ariaLabel} className={cn("absolute inset-x-0 top-full z-50 mt-1 max-h-72 overflow-y-auto border border-slate-200 bg-white py-1 shadow-2xl dark:border-[#3a3a3e] dark:bg-[#1a1a1d]", menuClassName)}>
      {options.map((option) => <button
        key={option.value}
        type="button"
        role="option"
        aria-selected={selectedValue === option.value}
        disabled={option.disabled}
        onClick={() => choose(option.value)}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40",
          selectedValue === option.value
            ? "bg-[#f54449] font-bold text-white"
            : "text-slate-700 hover:bg-slate-100 hover:text-[#f54449] dark:text-[#d2d2d7] dark:hover:bg-[#27272b] dark:hover:text-white",
        )}
      >
        <span>{option.label}</span>
        {selectedValue === option.value && <Check size={14} className="shrink-0" />}
      </button>)}
    </div>}
  </div>;
}
