/**
 * Lightweight i18n layer.
 * UI strings live here (English for the MVP) — the dictionary shape makes it
 * trivial to add `az`, `tr`, `ar`, … later without touching components.
 */
export const locales = ["en", "az", "tr", "ar"] as const;
export type Locale = (typeof locales)[number];

const en = {
  brand: "Saadat",
  brandSub: "Qur'an Sanctuary",
  nav: { reciters: "Reciters", surahs: "Surahs", atmosphere: "Atmosphere", nowPlaying: "Now Playing" },
  hero: {
    titleA: "Qur'an",
    titleB: "Peace and Focus",
    subtitle: "Choose your reciter, select your atmosphere, and listen in peace.",
    cta: "Start Listening",
    secondary: "Explore Surahs",
  },
  reciters: {
    title: "Choose your reciter",
    subtitle: "Two master voices. More arriving soon.",
    listen: "Listen",
    select: "Choose reciter",
  },
  surahs: {
    title: "Choose a surah",
    subtitle: "Search by name or number — in English, transliteration, or Azerbaijani.",
    searchPlaceholder: "Search surahs… e.g. Ar-Rahman, Yasin, 67",
    ayahs: "Ayahs",
    duration: "Duration",
    play: "Play",
    noneFound: "No surahs match your search.",
  },
  atmosphere: {
    title: "Choose your atmosphere",
    subtitle: "An ambient layer that stays independent from the recitation.",
    nature: "Nature",
    cozy: "Cozy",
    focus: "Focus",
    on: "Ambient on",
    off: "Ambient off",
    preview: "Play sound",
  },
  recitation: {
    title: "Recitation",
    verse: "Verse",
    show: "Show recitation",
    hide: "Hide recitation",
    loading: "Loading transliteration…",
    unavailable: "Transliteration is unavailable for this surah.",
    synced: "Synchronized with recitation",
    tapVerse: "Tap a verse to jump",
  },
  player: {
    quran: "Qur'an",
    ambient: "Ambience",
    on: "On",
    off: "Off",
    play: "Play",
    pause: "Pause",
    previous: "Previous surah",
    next: "Next surah",
    quranVolume: "Qur'an volume",
    ambientVolume: "Ambient volume",
    repeat: "Repeat",
    autoNext: "Auto-next",
    resume: "Resume listening",
    loading: "Loading…",
  },
  settings: { title: "Settings" },
  errors: {
    audio: "Unable to load this recitation. Please try again or choose another source.",
    ambient: "Unable to load this ambient sound. Please choose another.",
    video: "Background video unavailable — atmosphere still plays.",
  },
  footer: {
    madeWith: "Crafted for peaceful listening",
  },
};

export type TranslationKey = keyof typeof en;

const dictionaries: Record<Locale, typeof en> = { en, az: en, tr: en, ar: en };

export function t(key: string): string {
  // Flat lookup with dot paths (keys are flat here; nested handled by caller helpers).
  const dict = dictionaries.en as Record<string, unknown>;
  return (dict[key] as string) ?? key;
}

export const dict = en;
