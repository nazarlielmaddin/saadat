"use client";

import { motion } from "framer-motion";
import {
  Bird, Cat, CloudLightning, CloudRain, Droplets, Flame, Home, Moon,
  Mountain, Pause, Play, Trees, Waves, Wind, AudioWaveform, CloudFog,
} from "lucide-react";
import { ambientCategories, ambientSounds, getAmbientSound } from "@/data/ambientSounds";
import { usePlayer, usePlayback } from "@/lib/audio/player-context";
import { dict } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Waveform } from "@/components/Waveform";

const ICONS: Record<string, typeof CloudRain> = {
  rain: CloudRain,
  heavyRain: CloudRain,
  thunder: CloudLightning,
  wind: Wind,
  ocean: Waves,
  river: Droplets,
  water: Droplets,
  forest: Trees,
  birds: Bird,
  night: Moon,
  fireplace: Flame,
  cat: Cat,
  room: Home,
  whiteNoise: AudioWaveform,
  brownNoise: CloudFog,
  deepNoise: CloudFog,
};

function AmbientCard({ soundId }: { soundId: string }) {
  const sound = getAmbientSound(soundId)!;
  const Icon = ICONS[sound.id] ?? Mountain;
  const { soundId: activeId, selectAmbient, toggleAmbient } = usePlayer();
  const { ambientPlaying } = usePlayback();
  const active = activeId === sound.id;
  const playing = active && ambientPlaying;

  const handleClick = () => {
    if (active) toggleAmbient();
    else selectAmbient(sound.id);
  };

  return (
    <motion.button
      layout
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-pressed={active}
      aria-label={`${sound.name} — ${active ? dict.atmosphere.on : dict.atmosphere.off}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-500",
        active
          ? "border-gold/50 bg-white/[0.06] shadow-[0_0_50px_-18px_rgba(200,169,124,0.4)]"
          : "border-line bg-white/[0.03] hover:border-line hover:bg-white/[0.05]",
      )}
    >
      {/* CSS-art thumbnail */}
      <div
        className="animate-shimmer relative flex aspect-[16/9] items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(110% 110% at 30% 15%, ${sound.gradient[0]}55 0%, ${sound.gradient[1]} 75%)`,
        }}
      >
        <Icon className="h-8 w-8 text-mist/70 transition-transform duration-700 group-hover:scale-110" strokeWidth={1.2} />

        {/* Play/pause chip */}
        <span
          className={cn(
            "absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300",
            playing ? "bg-gold text-ink" : "bg-black/40 text-mist group-hover:bg-gold/90 group-hover:text-ink",
          )}
        >
          {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 translate-x-[1px] fill-current" />}
        </span>

        {playing && <Waveform bars={4} playing className="absolute top-3 right-3 h-4" />}
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-3.5">
        <span className={cn("text-sm", active ? "text-gold-soft" : "text-mist")}>{sound.name}</span>
        <span className="text-[10px] tracking-[0.2em] text-mist-faint uppercase">{sound.category}</span>
      </div>
    </motion.button>
  );
}

export function AmbientSelector() {
  return (
    <section id="atmosphere" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:py-28 lg:px-8 lg:py-36">
      <div className="mb-14 text-center">
        <h2 className="font-display text-4xl text-mist lg:text-5xl">{dict.atmosphere.title}</h2>
        <p className="mt-4 text-mist-dim">{dict.atmosphere.subtitle}</p>
      </div>

      <div className="space-y-14">
        {ambientCategories.map((cat) => {
          const items = ambientSounds.filter((s) => s.category === cat.id);
          return (
            <div key={cat.id}>
              <h3 className="mb-6 flex items-center gap-4 text-sm tracking-[0.25em] text-mist-dim uppercase">
                <span className="h-px w-8 bg-gold/50" />
                {cat.label}
                <span className="h-px flex-1 bg-line-soft" />
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {items.map((s) => (
                  <AmbientCard key={s.id} soundId={s.id} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}