"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Eye, EyeOff, Loader2, MousePointerClick } from "lucide-react";
import { getRecitation, getSurah, getTimings } from "@/data/generated";
import { getReciter } from "@/data/reciters";
import { getVerses } from "@/data/transliterations";
import { getArabicVerses } from "@/data/arabic";
import { usePlayer, usePlayback } from "@/lib/audio/player-context";
import { dict } from "@/lib/i18n";
import { activeVerseIndex, cn, formatTime } from "@/lib/utils";
import type { TransliterationStyle } from "@/lib/types";

const STYLES: Array<{ id: TransliterationStyle; label: string }> = [
  { id: "accurate", label: "Accurate" },
  { id: "simple", label: "Simple" },
];

const BISMILLAH_AR = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
const shouldShowBismillah = (surahId: number) => surahId !== 1;
const stripBismillah = (text: string) => {
  if (text.startsWith(BISMILLAH_AR)) return text.slice(BISMILLAH_AR.length).trim();
  return text;
};

type DisplayMode = "transliteration" | "arabic" | "both";

const DISPLAY_MODES: Array<{ id: DisplayMode; label: string; arabic?: boolean }> = [
  { id: "transliteration", label: "Transliteration" },
  { id: "arabic", label: "العربية", arabic: true },
  { id: "both", label: "Both" },
];

export function RecitationView() {
  const {
    reciterId, surahId, showRecitation,
    setShowRecitation, transliterationStyle, setTransliterationStyle, seek, playQuran,
  } = usePlayer();
  const { currentTime } = usePlayback();

  const surah = getSurah(surahId);
  const reciter = getReciter(reciterId);
  const recitation = getRecitation(reciterId, surahId);
  const timings = useMemo(() => getTimings(reciterId, surahId), [reciterId, surahId]);

  const [data, setData] = useState<{
    id: number;
    style: TransliterationStyle;
    verses: string[];
  } | null>(null);
  const [errorId, setErrorId] = useState<number | null>(null);

  // Arabic state — mirrors transliteration layer (base-path aware, cache, force-cache)
  const [arabicData, setArabicData] = useState<{ id: number; verses: string[] } | null>(null);
  const [arabicErrorId, setArabicErrorId] = useState<number | null>(null);

  // Display mode for the transliteration section (Arabic + transliteration)
  const [displayMode, setDisplayMode] = useState<DisplayMode>("transliteration");
  // Simple boolean derived for backwards-compat / toggle convenience
  const showArabic = displayMode === "arabic" || displayMode === "both";

  const activeRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const userScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getVerses(surahId, transliterationStyle)
      .then((v) => {
        if (cancelled) return;
        if (v) setData({ id: surahId, style: transliterationStyle, verses: v });
        else setErrorId(surahId);
      })
      .catch(() => {
        if (cancelled) return;
        setErrorId(surahId);
      });
    return () => {
      cancelled = true;
    };
  }, [surahId, transliterationStyle]);

  useEffect(() => {
    let cancelled = false;
    getArabicVerses(surahId)
      .then((v) => {
        if (cancelled) return;
        if (v) setArabicData({ id: surahId, verses: v });
        else setArabicErrorId(surahId);
      })
      .catch(() => {
        if (cancelled) return;
        setArabicErrorId(surahId);
      });
    return () => {
      cancelled = true;
    };
  }, [surahId]);

  const verses =
    data && data.id === surahId && data.style === transliterationStyle ? data.verses : null;
  const arabicVerses =
    arabicData && arabicData.id === surahId ? arabicData.verses : null;

  const isArabicVisible = showArabic;
  const isTranslitVisible = displayMode === "transliteration" || displayMode === "both";

  const transLoading = isTranslitVisible && verses === null && errorId !== surahId;
  const arabicLoading = isArabicVisible && arabicVerses === null && arabicErrorId !== surahId;
  const loading = transLoading || arabicLoading;

  const transFailed = isTranslitVisible && errorId === surahId && verses === null;
  const arabicFailed = isArabicVisible && arabicErrorId === surahId && arabicVerses === null;
  // Failed if every visible layer failed (for "both", show partial if at least one succeeds)
  const failed = isTranslitVisible && isArabicVisible
    ? transFailed && arabicFailed
    : isTranslitVisible ? transFailed : arabicFailed;

  const hasTrans = verses !== null;
  const hasArabic = arabicVerses !== null;

  const activeVerse = useMemo(() => {
    if (!timings) return null;
    return activeVerseIndex(timings, currentTime);
  }, [timings, currentTime]);

  /* Auto-scroll — ayə dəyişdikcə transliteration / Arabic qutusu proporsional izləsin, oxunan ayə mərkəzdə qalsın */
  useEffect(() => {
    if (activeVerse == null || !scrollRef.current) return;
    if (userScrollingRef.current) return;
    // Double rAF ensures DOM has updated with new active verse
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = scrollRef.current;
        if (!container) return;
        // Find active element reliably via data attribute (ref timing can lag)
        const el = (container.querySelector('[data-active="true"]') as HTMLElement | null) || activeRef.current;
        if (!el) return;
        const cRect = container.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();
        const offset = eRect.top - cRect.top + container.scrollTop;
        const targetTop = offset - container.clientHeight / 2 + el.clientHeight / 2;
        const maxTop = Math.max(0, container.scrollHeight - container.clientHeight);
        const clamped = Math.max(0, Math.min(targetTop, maxTop));
        if (Math.abs(container.scrollTop - clamped) < 24) return;
        container.scrollTo({ top: clamped, behavior: "smooth" });
      });
    });
  }, [activeVerse, displayMode]);

  const handleUserScroll = () => {
    userScrollingRef.current = true;
    if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      userScrollingRef.current = false;
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const jumpToVerse = (i: number) => {
    if (!timings) return;
    // For surahs with Bismillah header, verse 1's real start is at timings[0] (after Bismillah)
    // For surahs without Bismillah (1 and 9), verse 1 starts at 0
    const hasBismillahHeader = shouldShowBismillah(surahId);
    const seekMs = hasBismillahHeader ? (i === 0 ? timings[0] : timings[i]) : (i === 0 ? 0 : timings[i - 1]);
    // Fallback: if timings[i] is undefined (e.g., last verse), seek to last timing
    const finalMs = seekMs ?? timings[timings.length - 1] ?? 0;
    seek(finalMs / 1000);
    // Jump AND continue from there — even if the Qur'an layer was OFF.
    playQuran();
  };

  const jumpToBismillah = () => {
    seek(0);
    playQuran();
  };

  // Build render list that keeps 1:1 verse mapping (Arabic array aligns with transliteration)
  // For surahs 2-114 except 9, strip Bismillah prefix from first Arabic verse (it will be shown as centered header)
  const renderList = useMemo(() => {
    const stripFirst = shouldShowBismillah(surahId);
    if (displayMode === "arabic") {
      if (!arabicVerses) return [];
      return arabicVerses.map((arabic, i) => ({
        arabic: i === 0 && stripFirst ? stripBismillah(arabic) : arabic,
        translit: null as string | null,
        index: i,
      }));
    }
    if (displayMode === "transliteration") {
      if (!verses) return [];
      return verses.map((translit, i) => ({ arabic: null as string | null, translit, index: i }));
    }
    // both — align by index, handle mismatched lengths gracefully
    const len = Math.max(verses?.length ?? 0, arabicVerses?.length ?? 0);
    const list: Array<{ arabic: string | null; translit: string | null; index: number }> = [];
    for (let i = 0; i < len; i++) {
      const rawArabic = arabicVerses?.[i] ?? null;
      list.push({
        arabic: i === 0 && stripFirst && rawArabic ? stripBismillah(rawArabic) : rawArabic,
        translit: verses?.[i] ?? null,
        index: i,
      });
    }
    return list;
  }, [displayMode, verses, arabicVerses, surahId]);

  const canRender = displayMode === "arabic" ? hasArabic : displayMode === "transliteration" ? hasTrans : (hasArabic || hasTrans);

  return (
    <section id="now-playing" className="mx-auto max-w-4xl scroll-mt-24 px-5 py-20 sm:py-28 lg:py-36">
      <div className="mb-12 text-center">
        <h2 className="font-display text-4xl text-mist lg:text-5xl">
          {surah?.englishName}
          <span className="mt-2 block font-serif text-xl font-normal text-mist-dim">
            {surah?.transliteratedName} · {surah?.azerbaijaniName}
          </span>
        </h2>
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-mist-faint">
          {reciter?.image && (
            <Image
              src={reciter.image}
              alt=""
              width={20}
              height={20}
              className="rounded-full object-cover object-top"
            />
          )}
          {reciter?.name} · {surah?.verses} {dict.surahs.ayahs}
          {recitation?.durationSeconds ? ` · ${formatTime(recitation.durationSeconds)}` : ""}
        </p>
        {/* Sync status — only shown when verse timestamps exist */}
        {timings && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-xs text-mist-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {dict.recitation.synced}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        {/* Display mode — Arabic toggle (العربية) */}
        <div className="glass flex rounded-full p-1" role="group" aria-label="Display mode">
          {DISPLAY_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setDisplayMode(m.id)}
              aria-pressed={displayMode === m.id}
              className={cn(
                "rounded-full px-4 py-2 text-xs transition-all duration-300",
                m.arabic && "font-arabic text-sm leading-none",
                displayMode === m.id ? "bg-mist text-ink" : "text-mist-dim hover:text-mist",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Transliteration style — only relevant when transliteration is visible */}
        {isTranslitVisible && (
          <div className="glass flex rounded-full p-1" role="group" aria-label="Transliteration style">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setTransliterationStyle(s.id)}
                aria-pressed={transliterationStyle === s.id}
                className={cn(
                  "rounded-full px-4 py-2 text-xs transition-all duration-300",
                  transliterationStyle === s.id ? "bg-mist text-ink" : "text-mist-dim hover:text-mist",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowRecitation(!showRecitation)}
          aria-pressed={showRecitation}
          className="glass flex items-center gap-2 rounded-full px-5 py-2.5 text-xs text-mist transition-all duration-300 hover:border-gold/40 hover:text-gold-soft"
        >
          {showRecitation ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showRecitation ? dict.recitation.hide : dict.recitation.show}
        </button>
      </div>

      {/* Reading */}
      <div className="glass relative overflow-hidden rounded-3xl">
        {loading && (
          <div className="flex items-center justify-center gap-3 py-24 text-sm text-mist-faint">
            <Loader2 className="h-4 w-4 animate-spin" /> {dict.recitation.loading}
          </div>
        )}

        {!loading && failed && (
          <div className="px-8 py-24 text-center text-sm text-mist-dim">
            {dict.recitation.unavailable}
          </div>
        )}

        {!loading && !failed && !showRecitation && (
          <div className="flex flex-col items-center gap-4 px-8 py-24 text-center">
            <Eye className="h-6 w-6 text-mist-faint" />
            <p className="text-sm text-mist-faint">{dict.recitation.hide}</p>
            <button
              onClick={() => setShowRecitation(true)}
              className="glass rounded-full px-6 py-3 text-sm text-mist transition-colors hover:border-gold/40 hover:text-gold-soft"
            >
              {dict.recitation.show}
            </button>
          </div>
        )}

        {!loading && !failed && showRecitation && canRender && (
          <div
            ref={scrollRef}
            className="max-h-[62vh] overflow-y-auto px-6 py-10 sm:px-12 scroll-smooth"
            onWheel={handleUserScroll}
            onTouchMove={handleUserScroll}
          >
            {shouldShowBismillah(surahId) && isArabicVisible && (
              <p
                dir="rtl"
                lang="ar"
                onClick={jumpToBismillah}
                className={cn(
                  "font-arabic text-center text-[1.7rem] leading-[2.2] sm:text-[2rem] mb-8 pb-6 border-b border-line/20 cursor-pointer transition-colors",
                  activeVerse === 0 && timings && currentTime * 1000 < timings[0]
                    ? "text-gold-soft"
                    : "text-gold-soft/80 hover:text-gold-soft"
                )}
                title="Bismillah — click to play from start"
              >
                {BISMILLAH_AR}
              </p>
            )}
            <div className="mx-auto max-w-2xl space-y-2">
              {renderList.map(({ arabic, translit, index: i }) => {
                const isBismillahTime = shouldShowBismillah(surahId) && timings ? currentTime * 1000 < timings[0] : false;
                const active = isBismillahTime ? false : activeVerse === i;
                return (
                  <motion.div
                    key={i}
                    data-verse={i}
                    data-active={active ? "true" : undefined}
                    ref={active ? activeRef : undefined}
                    initial={false}
                    animate={{ opacity: active ? 1 : 0.62 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => jumpToVerse(i)}
                    className={cn(
                      "group flex cursor-pointer gap-4 rounded-2xl border border-transparent px-4 py-4 transition-colors duration-500 sm:gap-5",
                      active && "verse-active bg-gold/10",
                      timings && "hover:border-line hover:bg-white/[0.03]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] tabular-nums transition-colors duration-500",
                        active
                          ? "border-gold/60 bg-gold/15 text-gold-soft"
                          : "border-line text-mist-faint",
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      {isArabicVisible && arabic && (
                        <p
                          dir="rtl"
                          lang="ar"
                          className="font-arabic text-right text-[1.55rem] leading-[2.1] text-mist sm:text-[1.85rem] sm:leading-[2.15]"
                        >
                          {arabic}
                        </p>
                      )}
                      {isTranslitVisible && translit && (
                        <p
                          className={cn(
                            "font-serif text-mist",
                            displayMode === "both"
                              ? "text-[0.98rem] leading-[1.85] text-mist-dim sm:text-[1.05rem]"
                              : "text-[1.15rem] leading-[1.85] sm:text-[1.35rem] sm:leading-[1.9]",
                          )}
                        >
                          {translit}
                        </p>
                      )}
                      {/* Fallback when one side missing in "both" mode */}
                      {displayMode === "both" && !arabic && translit && isArabicVisible && !hasArabic && (
                        <p dir="rtl" className="font-arabic text-right text-mist-faint">—</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {timings && (
              <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-[11px] text-mist-faint">
                <MousePointerClick className="h-3 w-3" /> {dict.recitation.tapVerse}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
