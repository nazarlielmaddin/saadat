import type { Reciter } from "@/lib/types";

/**
 * Reciter catalog.
 * To add a reciter: add an entry here, then add `{reciterId} × 114` entries
 * to `src/data/generated/recitations.json` (see `scripts/fetch-data.mjs`).
 */
export const reciters: Reciter[] = [
  {
    id: "yasir-al-dawsari",
    name: "Yasir Al-Dawsari",
    arabicName: "ياسر الدوسري",
    image: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/reciters/yasir-al-dawsari.jpg`,
    bio: "Imam of the Grand Mosque in Mecca, known for a serene, measured style beloved worldwide.",
    bioLong:
      "Yasir Al-Dawsari served as an imam of the Grand Mosque (Masjid al-Haram) in Mecca, where his calm, deliberate recitation earned him a global following. His Hafs 'an 'Asim recordings are among the most widely streamed Qur'an recitations online.",
    hasTimestamps: true,
    origin: "Saudi Arabia",
  },
  {
    id: "haitham-al-dakhin",
    name: "Haitham Al-Dakhin",
    arabicName: "هيثم الدخين",
    image: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/reciters/haitham-al-dakhin.jpg`,
    bio: "Saudi reciter famed for his warm, flowing Hafs 'an 'Asim recordings shared across the world.",
    bioLong:
      "Haitham Al-Dakhin is a Saudi Qur'an reciter whose Hafs 'an 'Asim recordings — hosted on the official mp3quran.net mushaf — are a favorite for daily listening, tarawih, and sleep. His pacing is gentle and deeply soothing.",
    hasTimestamps: false,
    origin: "Saudi Arabia",
  },
];

export function getReciter(id: string): Reciter | undefined {
  return reciters.find((r) => r.id === id);
}
