/** Shared domain types for Saadat. */

export interface Reciter {
  id: string;
  name: string;
  /** Arabic-script name (used for typographic cards when no photo exists). */
  arabicName: string;
  image?: string;
  /** Short biography shown on the reciter card. */
  bio: string;
  /** Longer bio for the reciter experience view. */
  bioLong: string;
  /** Transliteration style available for this reciter's timestamps. */
  hasTimestamps: boolean;
  origin: string;
}

export interface Surah {
  id: number;
  number: number;
  arabicName: string;
  englishName: string;
  transliteratedName: string;
  azerbaijaniName: string;
  meaning: string;
  verses: number;
  revelationType: "Meccan" | "Medinan";
}

export interface Recitation {
  id: string;
  reciterId: string;
  surahId: number;
  audioUrl: string;
  /** Known duration in seconds (null when unknown — filled at runtime). */
  durationSeconds: number | null;
  source: string;
}

export type AmbientCategory = "nature" | "cozy" | "focus";

export interface AmbientSound {
  id: string;
  name: string;
  category: AmbientCategory;
  audioUrl: string;
  videoUrl: string;
  /** Two hex colors used to render the CSS-art thumbnail. */
  gradient: [string, string];
  source: string;
  /** Per-sound default volume (0..1). If set, multiplies the global ambientVolume. */
  volume?: number;
}

export interface MediaSource {
  label: string;
  url: string;
  license: string;
  note?: string;
}

export type RepeatMode = "off" | "one" | "all";

export type TransliterationStyle = "accurate" | "simple";
