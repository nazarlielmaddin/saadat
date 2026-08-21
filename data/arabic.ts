/**
 * Arabic layer.
 *
 * Raw data: alquran.cloud `quran-uthmani` (Uthmāni script, all 6236 verses),
 * bundled at build time into `public/data/arabic.json` and fetched
 * lazily at runtime (keeps the JS bundle lean).
 *
 * Mirrors the transliteration layer: base-path aware, cached, force-cache.
 */

let cache: Record<string, string[]> | null = null;

export async function loadArabic(): Promise<Record<string, string[]>> {
  if (cache) return cache;
  // Base-path aware: works on localhost and under GitHub Pages subpaths.
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const res = await fetch(`${base}/data/arabic.json`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`arabic HTTP ${res.status}`);
  cache = (await res.json()) as Record<string, string[]>;
  return cache;
}

export async function getArabicVerses(surahId: number): Promise<string[] | null> {
  const all = await loadArabic();
  const verses = all[String(surahId)];
  if (!verses) return null;
  return verses;
}
