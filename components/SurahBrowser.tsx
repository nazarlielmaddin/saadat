"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Search } from "lucide-react";
import { getRecitation, getSurah, surahs } from "@/data/generated";
import { getReciter } from "@/data/reciters";
import { usePlayer, usePlayback } from "@/lib/audio/player-context";
import { dict } from "@/lib/i18n";
import { cn, formatTime } from "@/lib/utils";
import { Waveform } from "@/components/Waveform";

function normalize(s: string) {
  return s.toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/['’ʿ]/g, "");
}

function SurahRow({ surahId }: { surahId: number }) {
  const surah = getSurah(surahId)!;
  const { reciterId, selectSurah, surahId: currentId } = usePlayer();
  const { quranPlaying } = usePlayback();
  const recitation = getRecitation(reciterId, surahId);
  const isCurrent = currentId === surahId;
  const isPlaying = isCurrent && quranPlaying;

  const play = () => {
    selectSurah(surahId, true);
    document.getElementById("now-playing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      className={cn(
        "group flex items-center gap-4 border-b border-line-soft px-4 py-4 transition-colors duration-300 sm:gap-6 sm:px-6",
        isCurrent ? "bg-white/[0.045]" : "hover:bg-white/[0.03]",
      )}
    >
      {/* Number */}
      <span
        className={cn(
          "w-10 shrink-0 text-center font-mono text-sm tabular-nums",
          isCurrent ? "text-gold" : "text-mist-faint",
        )}
      >
        {String(surah.number).padStart(3, "0")}
      </span>

      {/* Names */}
      <button onClick={play} className="min-w-0 flex-1 text-left" aria-label={`${dict.surahs.play} ${surah.englishName}`}>
        <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className={cn("font-display text-lg", isCurrent ? "text-gold-soft" : "text-mist")}>
            {surah.englishName}
          </span>
          <span className="text-sm text-mist-dim">{surah.transliteratedName}</span>
          <span className="text-xs text-mist-faint">{surah.azerbaijaniName}</span>
        </span>
        <span className="mt-0.5 block text-xs text-mist-faint">
          {surah.verses} {dict.surahs.ayahs}
          {surah.revelationType === "Meccan" ? " · Meccan" : " · Medinan"}
        </span>
      </button>

      {/* Duration + play */}
      <span className="hidden shrink-0 font-mono text-xs tabular-nums text-mist-faint sm:block">
        {recitation?.durationSeconds ? formatTime(recitation.durationSeconds) : "—"}
      </span>

      <div className="flex w-16 shrink-0 items-center justify-end gap-3">
        {isPlaying ? (
          <Waveform bars={4} playing className="h-4" />
        ) : (
          <button
            onClick={play}
            aria-label={`${dict.surahs.play} ${surah.englishName}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mist-dim transition-all duration-300 group-hover:border-gold/50 group-hover:text-gold-soft hover:scale-105"
          >
            <Play className="h-4 w-4 translate-x-[1px] fill-current" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function SurahBrowser() {
  const [query, setQuery] = useState("");
  const { reciterId } = usePlayer();

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return surahs;
    return surahs.filter((s) => {
      const n = normalize(`${s.englishName} ${s.transliteratedName} ${s.azerbaijaniName} ${s.meaning}`);
      return n.includes(q) || String(s.number).includes(q) || normalize(s.transliteratedName).startsWith(q);
    });
  }, [query]);

  const reciter = getReciter(reciterId);

  return (
    <section id="surahs" className="mx-auto max-w-4xl scroll-mt-24 px-5 py-20 sm:py-28 lg:py-36">
      <div className="mb-12 text-center">
        <h2 className="font-display text-4xl text-mist lg:text-5xl">{dict.surahs.title}</h2>
        <p className="mt-4 text-mist-dim">
          {dict.surahs.subtitle}
        </p>
        {reciter && (
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-mist-faint">
            {reciter.image ? (
              <Image
                src={reciter.image}
                alt=""
                width={20}
                height={20}
                className="rounded-full object-cover object-top"
              />
            ) : (
              <span className="h-5 w-5 rounded-full bg-gold/20" />
            )}
            {reciter.name}
          </p>
        )}
      </div>

      {/* Search */}
      <div className="glass relative mb-6 flex items-center gap-3 rounded-2xl px-5 py-3.5 transition-colors focus-within:border-gold/40">
        <Search className="h-4 w-4 shrink-0 text-mist-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.surahs.searchPlaceholder}
          aria-label={dict.surahs.searchPlaceholder}
          className="w-full bg-transparent text-base text-mist placeholder:text-mist-faint focus:outline-none sm:text-sm"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-xs text-mist-faint hover:text-mist">
            Clear
          </button>
        )}
      </div>

      {/* List */}
      <div className="glass overflow-hidden rounded-3xl">
        {filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-mist-faint">{dict.surahs.noneFound}</p>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto" role="list" aria-label={dict.surahs.title}>
            {filtered.map((s) => (
              <SurahRow key={s.id} surahId={s.number} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
