"use client";

import { Volume1, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * VolumeControl — icon + slim slider.
 * `muted` + `onToggleMute` are optional (used by the ambient layer).
 */
export function VolumeControl({
  value,
  onChange,
  label,
  muted = false,
  onToggleMute,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  muted?: boolean;
  onToggleMute?: () => void;
  className?: string;
}) {
  const Icon = muted || value === 0 ? VolumeX : value < 0.5 ? Volume1 : Volume2;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {onToggleMute && (
        <button
          onClick={onToggleMute}
          aria-label={muted ? `Unmute ${label}` : `Mute ${label}`}
          className="text-mist-faint transition-colors hover:text-mist"
        >
          <Icon className="h-4 w-4" />
        </button>
      )}
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={muted ? 0 : value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="slider w-20 sm:w-24"
      />
    </div>
  );
}