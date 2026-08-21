import surahsJson from "@/data/generated/surahs";
import recitationsJson from "@/data/generated/recitations";
import timingsJson from "@/data/generated/timings";
import type { Recitation, Surah } from "@/lib/types";

export const surahs = surahsJson as unknown as Surah[];
export const recitations = recitationsJson as unknown as Recitation[];
export const timingsBySurah = timingsJson as unknown as Record<string, number[]>;

export function getSurah(id: number): Surah | undefined {
  return surahs.find((s) => s.number === id);
}

export function getRecitation(reciterId: string, surahId: number): Recitation | undefined {
  return recitations.find((r) => r.reciterId === reciterId && r.surahId === surahId);
}

/** Verse start offsets (ms) for a reciter+surah — null when unavailable. */
export function getTimings(reciterId: string, surahId: number): number[] | null {
  if (!recitersWithTimings.has(reciterId)) return null;
  return timingsBySurah[String(surahId)] ?? null;
}

/** Reciters that ship verified verse-level timestamps. */
export const recitersWithTimings = new Set(["yasir-al-dawsari"]);
