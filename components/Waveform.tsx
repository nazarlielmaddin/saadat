"use client";

import { cn } from "@/lib/utils";

/**
 * Waveform — a calm, minimal equalizer. Reacts only while audio plays;
 * deliberately restrained (no nightclub energy).
 */
export function Waveform({
  bars = 5,
  playing = false,
  className,
  barClassName,
}: {
  bars?: number;
  playing?: boolean;
  className?: string;
  barClassName?: string;
}) {
  return (
    <span
      className={cn("flex items-end gap-[3px]", className)}
      role="img"
      aria-label={playing ? "Audio playing" : "Audio paused"}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] rounded-full",
            playing ? "eq-bar bg-gold" : "bg-mist-faint/60",
            barClassName,
          )}
          style={{
            height: playing ? "100%" : "35%",
            animationDelay: playing ? `${i * 0.13}s` : undefined,
            animationDuration: playing ? `${1.05 + (i % 3) * 0.18}s` : undefined,
          }}
        />
      ))}
    </span>
  );
}