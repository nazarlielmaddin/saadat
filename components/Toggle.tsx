"use client";

import { cn } from "@/lib/utils";

/** Accessible switch (role="switch"). */
export function Toggle({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-300",
        checked ? "border-gold/60 bg-gold/25" : "border-line bg-white/[0.06]",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full transition-transform duration-300",
          checked ? "translate-x-[22px] bg-gold-soft" : "translate-x-[3px] bg-mist-faint",
        )}
      />
    </button>
  );
}