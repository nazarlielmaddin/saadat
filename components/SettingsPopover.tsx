"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Repeat, Settings2 } from "lucide-react";
import { usePlayer } from "@/lib/audio/player-context";
import { dict } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/Toggle";
import type { RepeatMode, TransliterationStyle } from "@/lib/types";

const REPEATS: Array<{ id: RepeatMode; label: string }> = [
  { id: "off", label: "Off" },
  { id: "one", label: "One" },
  { id: "all", label: "All" },
];
const STYLES: Array<{ id: TransliterationStyle; label: string }> = [
  { id: "accurate", label: "Accurate" },
  { id: "simple", label: "Simple" },
];

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-mist-dim">{label}</span>
      <div className="glass flex rounded-full p-0.5" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            aria-pressed={value === o.id}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] transition-all duration-300",
              value === o.id ? "bg-mist text-ink" : "text-mist-dim hover:text-mist",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPopover() {
  const {
    repeat, setRepeat, autoNext, setAutoNext,
    showRecitation, setShowRecitation, transliterationStyle, setTransliterationStyle,
  } = usePlayer();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={dict.settings.title}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300",
          open ? "border-gold/50 text-gold-soft" : "border-line text-mist-dim hover:text-mist",
        )}
      >
        <Settings2 className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong absolute right-0 bottom-12 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-2xl p-5 shadow-soft"
          >
            <p className="mb-4 text-xs tracking-[0.25em] text-gold uppercase">{dict.settings.title}</p>
            <div className="space-y-4">
              <Segmented options={REPEATS} value={repeat} onChange={setRepeat} label={dict.player.repeat} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-mist-dim">{dict.player.autoNext}</span>
                <Toggle checked={autoNext} onChange={setAutoNext} label={dict.player.autoNext} />
              </div>
              <Segmented options={STYLES} value={transliterationStyle} onChange={setTransliterationStyle} label="Transliteration" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-mist-dim">{dict.recitation.show}</span>
                <Toggle checked={showRecitation} onChange={setShowRecitation} label={dict.recitation.show} />
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-mist-faint">
                <Repeat className="h-3 w-3" />
                {repeat === "one" ? "Repeat current surah" : repeat === "all" ? "Repeat all surahs" : "Repeat off"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}