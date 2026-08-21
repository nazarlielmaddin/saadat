"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  AlertTriangle, ListEnd, Loader2, Pause, Play, Repeat, SkipBack, SkipForward, X,
} from "lucide-react";
import { getRecitation, getSurah } from "@/data/generated";
import { getAmbientSound } from "@/data/ambientSounds";
import { getReciter } from "@/data/reciters";
import { usePlayer, usePlayback } from "@/lib/audio/player-context";
import { dict } from "@/lib/i18n";
import { cn, formatTime } from "@/lib/utils";
import { Toggle } from "@/components/Toggle";
import { VolumeControl } from "@/components/VolumeControl";
import { Waveform } from "@/components/Waveform";
import { SettingsPopover } from "@/components/SettingsPopover";
import type { RepeatMode } from "@/lib/types";

const REPEAT_ORDER: RepeatMode[] = ["off", "one", "all"];

function LayerLabel({ children, tone }: { children: React.ReactNode; tone: "gold" | "sage" }) {
  return (
    <span
      className={cn(
        "text-[10px] font-medium tracking-[0.22em] uppercase",
        tone === "gold" ? "text-gold" : "text-mist-dim",
      )}
    >
      {children}
    </span>
  );
}

export function PlayerBar() {
  const {
    reciterId, surahId, quranEnabled, quranError,
    quranVolume, setQuranVolume,
    repeat, setRepeat, autoNext, setAutoNext,
    toggleQuran, playQuran, pauseQuran, nextSurah, prevSurah, seek,
    soundId, ambientEnabled, ambientVolume, setAmbientVolume,
    ambientMuted, toggleAmbientMute, ambientLoop, setAmbientLoop,
    toggleAmbient, ambientError, dismissQuranError, dismissAmbientError,
  } = usePlayer();
  const { currentTime, duration, quranPlaying, quranLoading, ambientPlaying } = usePlayback();

  const surah = getSurah(surahId);
  const reciter = getReciter(reciterId);
  const recitation = getRecitation(reciterId, surahId);
  const sound = getAmbientSound(soundId);
  const hasQuran = Boolean(recitation);

  const cycleRepeat = () => {
    const i = REPEAT_ORDER.indexOf(repeat);
    setRepeat(REPEAT_ORDER[(i + 1) % REPEAT_ORDER.length]);
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 bottom-0 z-50 px-0 pb-0 sm:px-4 sm:pb-5"
    >
      <div className="glass-strong mx-auto max-w-5xl rounded-t-3xl pb-[env(safe-area-inset-bottom)] sm:rounded-3xl">
        {/* Error banners */}
        {(quranError || ambientError) && (
          <div className="flex flex-col gap-2 border-b border-line-soft px-5 py-3">
            {quranError && (
              <div className="flex items-center gap-2 text-xs text-gold-soft">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">{quranError}</span>
                <button onClick={dismissQuranError} aria-label="Dismiss" className="text-mist-faint hover:text-mist">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {ambientError && (
              <div className="flex items-center gap-2 text-xs text-mist-dim">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">{ambientError}</span>
                <button onClick={dismissAmbientError} aria-label="Dismiss" className="text-mist-faint hover:text-mist">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Row 1 — track + transport + progress */}
        <div className="flex items-center gap-3 px-4 pt-3.5 sm:gap-4 sm:px-5">
          {/* Art */}
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-line">
            {reciter?.image ? (
              <Image
                src={reciter.image}
                alt=""
                fill
                sizes="44px"
                className="object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold/25 to-ink-2">
                <span className="font-arabic text-sm text-gold-soft">{reciter?.arabicName}</span>
              </div>
            )}
            {quranPlaying && (
              <span className="absolute inset-0 flex items-end justify-center bg-black/30 pb-1">
                <Waveform bars={3} playing className="h-2.5" />
              </span>
            )}
          </div>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm text-mist">
              {surah?.englishName ?? "—"}
              <span className="ml-2 font-sans text-xs text-mist-faint">№ {surahId}</span>
            </p>
            <p className="truncate text-[11px] text-mist-dim">
              {reciter?.name} · {surah?.transliteratedName}
            </p>
          </div>

          {/* Transport */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={prevSurah}
              aria-label={dict.player.previous}
              className="flex h-9 w-9 items-center justify-center rounded-full text-mist-dim transition-colors hover:text-mist"
            >
              <SkipBack className="h-4 w-4 fill-current" />
            </button>
            <button
              onClick={quranPlaying ? pauseQuran : playQuran}
              aria-label={quranPlaying ? dict.player.pause : dict.player.play}
              disabled={!hasQuran}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-ink transition-all duration-300 hover:scale-105 hover:shadow-[0_0_36px_-8px_rgba(243,241,234,0.5)] disabled:opacity-40"
            >
              {quranLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : quranPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 translate-x-[1px] fill-current" />
              )}
            </button>
            <button
              onClick={nextSurah}
              aria-label={dict.player.next}
              className="flex h-9 w-9 items-center justify-center rounded-full text-mist-dim transition-colors hover:text-mist"
            >
              <SkipForward className="h-4 w-4 fill-current" />
            </button>
          </div>

          {/* Settings — always reachable (mobile overflow menu) */}
          <div className="md:hidden">
            <SettingsPopover />
          </div>

          {/* Progress (desktop) */}
          <div className="hidden min-w-0 flex-[1.4] items-center gap-3 lg:flex">
            <span className="w-10 shrink-0 text-right font-mono text-[11px] tabular-nums text-mist-faint">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek"
              className="slider flex-1"
              disabled={!duration}
            />
            <span className="w-10 shrink-0 font-mono text-[11px] tabular-nums text-mist-faint">
              {formatTime(duration)}
            </span>
          </div>

          {/* Quick controls */}
          <div className="hidden items-center gap-1.5 md:flex">
            <button
              onClick={cycleRepeat}
              aria-label={dict.player.repeat}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                repeat !== "off" ? "border-gold/50 text-gold-soft" : "border-line text-mist-dim hover:text-mist",
              )}
            >
              <Repeat className="h-3.5 w-3.5" />
              {repeat === "one" && <span className="absolute top-1 right-1 h-1 w-1 rounded-full bg-gold" />}
            </button>
            <button
              onClick={() => setAutoNext(!autoNext)}
              aria-label={dict.player.autoNext}
              aria-pressed={autoNext}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                autoNext ? "border-gold/50 text-gold-soft" : "border-line text-mist-dim hover:text-mist",
              )}
            >
              <ListEnd className="h-3.5 w-3.5" />
            </button>
            <SettingsPopover />
          </div>
        </div>

        {/* Progress (mobile/tablet) */}
        <div className="flex items-center gap-3 px-4 pt-2 lg:hidden">
          <span className="font-mono text-[11px] tabular-nums text-mist-faint">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            className="slider flex-1"
            disabled={!duration}
          />
          <span className="font-mono text-[11px] tabular-nums text-mist-faint">{formatTime(duration)}</span>
        </div>

        {/* Row 2 — independent layers (stacked on mobile, inline on tablet+) */}
        <div className="mt-3 flex flex-col gap-2.5 border-t border-line-soft px-4 py-3 sm:px-5 md:flex-row md:items-center md:gap-8">
          {/* Qur'an layer */}
          <div className="flex items-center gap-3">
            <LayerLabel tone="gold">{dict.player.quran}</LayerLabel>
            <Toggle checked={quranEnabled} onChange={toggleQuran} label={`${dict.player.quran} ${quranEnabled ? dict.player.on : dict.player.off}`} />
            <VolumeControl
              value={quranVolume}
              onChange={setQuranVolume}
              label={dict.player.quranVolume}
              className="ml-1"
            />
          </div>

          <span className="hidden h-6 w-px bg-line md:block" />

          {/* Ambient layer */}
          <div className="flex items-center gap-3">
            <LayerLabel tone="sage">{dict.player.ambient}</LayerLabel>
            <Toggle
              checked={ambientEnabled && ambientPlaying}
              onChange={toggleAmbient}
              label={`${dict.player.ambient} ${ambientEnabled ? dict.player.on : dict.player.off}`}
            />
            <span className="hidden max-w-24 truncate text-xs sm:block">
              {sound?.name ?? "None"}
            </span>
            <VolumeControl
              value={ambientVolume}
              onChange={setAmbientVolume}
              label={dict.player.ambientVolume}
              muted={ambientMuted}
              onToggleMute={toggleAmbientMute}
            />
            <button
              onClick={() => setAmbientLoop(!ambientLoop)}
              aria-label="Loop ambient"
              aria-pressed={ambientLoop}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                ambientLoop ? "border-gold/50 text-gold-soft" : "border-line text-mist-faint hover:text-mist",
              )}
            >
              <Repeat className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}