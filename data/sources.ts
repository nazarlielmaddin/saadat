import type { MediaSource } from "@/lib/types";

/**
 * Attribution registry — every external media/data dependency is tracked here
 * so sources are visible in config, not hidden in components.
 */
export const sources: MediaSource[] = [
  {
    label: "Qur'an audio — Yasir Al-Dawsari (128kbps, full surahs)",
    url: "https://cdn.islamic.network/quran/audio-surah/128/ar.yasseraldossari/1.mp3",
    license: "Islamic Network CDN — aggregated from quranicaudio.com archive (public distribution)",
  },
  {
    label: "Qur'an audio — Haitham Al-Dakhin (Hafs 'an 'Asim, 320kbps)",
    url: "https://server16.mp3quran.net/h_dukhain/Rewayat-Hafs-A-n-Assem/001.mp3",
    license: "mp3quran.net official hosted mushaf",
  },
  {
    label: "Surah metadata + Latin transliteration (6236 verses)",
    url: "https://api.alquran.cloud/v1/surah",
    license: "alquran.cloud (crowd-sourced; Qur'an text is public domain in most jurisdictions)",
  },
  {
    label: "Verse timings — Yasir Al-Dawsari",
    url: "https://www.everyayah.com/data/timings_files/Yasser_Ad-Dussary_128kbps.zip",
    license: "(C) VerseByVerseQuran.com — used with required link-back to versebyversequran.com",
    note: "Timings are approximate; used for verse highlighting only.",
  },
  {
    label: "Reciter portrait — Yasir Al-Dawsari",
    url: "https://commons.wikimedia.org/wiki/File:Yasser_Al-Dosari_(cropped).jpg",
    license: "CC BY-SA 4.0 (Wikimedia Commons)",
  },
  {
    label: "Ambient audio + background videos (16 sounds)",
    url: "https://pixabay.com/sound-effects/",
    license: "Pixabay Content License — free for commercial use, no attribution required",
  },
];
