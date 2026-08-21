import type { AmbientSound } from "@/lib/types";

/**
 * Ambient sound catalog — 16 verified Pixabay CDN audio/video pairs.
 * To add a sound: copy an entry, change id/name/category and the 3 URLs,
 * then add a matching icon + gradient in the UI if desired.
 */
export const ambientSounds: AmbientSound[] = [
  // ── Nature ────────────────────────────────────────────────────────────
  { id: "rain", name: "Rain", category: "nature", gradient: ["#1e3a5f", "#0b1526"],
    audioUrl: "https://cdn.pixabay.com/audio/2024/10/30/audio_42e6870f29.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2024/07/29/223788_medium.mp4",
    source: "Pixabay — atmospheric rain over leaves" },
  { id: "heavyRain", name: "Heavy Rain", category: "nature", gradient: ["#2b3a4a", "#0d1117"],
    audioUrl: "https://cdn.pixabay.com/audio/2026/08/12/audio_ef5d4fb704.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2023/09/06/179363-861795878_small.mp4",
    source: "Pixabay — heavy rainstorm on grass" },
  { id: "thunder", name: "Thunder", category: "nature", gradient: ["#3d2f5c", "#12101c"],
    audioUrl: "https://cdn.pixabay.com/audio/2025/07/16/audio_a368a84757.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2022/07/23/125192-732837222_small.mp4",
    source: "Pixabay — storm clouds with lightning" },
  { id: "wind", name: "Wind", category: "nature", gradient: ["#4a5a6a", "#141821"],
    audioUrl: "https://cdn.pixabay.com/audio/2025/12/28/audio_51b7de1a9f.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2023/04/11/158384-816637349_medium.mp4",
    source: "Pixabay — clouds moving in the wind" },
  { id: "ocean", name: "Ocean", category: "nature", gradient: ["#1c4e5f", "#08141b"],
    audioUrl: "https://cdn.pixabay.com/audio/2024/10/12/audio_7dd52a2e33.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2024/03/21/205011-926015732_medium.mp4",
    source: "Pixabay — ocean waves at night" },
  { id: "river", name: "River", category: "nature", gradient: ["#2f5d50", "#0c1a16"],
    audioUrl: "https://cdn.pixabay.com/audio/2025/03/01/audio_def86f49ba.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2023/01/18/146993-790648696_small.mp4",
    source: "Pixabay — creek in the rain" },
  { id: "water", name: "Water", category: "nature", gradient: ["#3b6b8f", "#0d1b26"],
    audioUrl: "https://cdn.pixabay.com/audio/2025/11/30/audio_e877dc8fbf.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2020/10/26/53385-474597353_small.mp4",
    source: "Pixabay — mountain stream",
    volume: 0.1 },
  { id: "forest", name: "Forest", category: "nature", gradient: ["#2c4a2e", "#0a120b"],
    audioUrl: "https://cdn.pixabay.com/audio/2025/02/03/audio_7599bcb342.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2022/07/17/124412-730817618_small.mp4",
    source: "Pixabay — rainy forest" },
  { id: "birds", name: "Birds", category: "nature", gradient: ["#5f5a3d", "#141410"],
    audioUrl: "https://cdn.pixabay.com/audio/2024/06/15/audio_7ab24f6957.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2022/10/20/135727-764361705_medium.mp4",
    source: "Pixabay — birds in flight" },
  { id: "night", name: "Night", category: "nature", gradient: ["#1a1e3d", "#06060f"],
    audioUrl: "https://cdn.pixabay.com/audio/2022/02/07/audio_51b5acd355.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2023/01/26/147996-793140610_large.mp4",
    source: "Pixabay — night moon over the ocean" },

  // ── Cozy ──────────────────────────────────────────────────────────────
  { id: "fireplace", name: "Fireplace", category: "cozy", gradient: ["#8a4b1f", "#1a0e05"],
    audioUrl: "https://cdn.pixabay.com/audio/2021/08/04/audio_d412a79df9.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2022/10/24/136334-764387851_large.mp4",
    source: "Pixabay — dark room fireplace" },
  { id: "cat", name: "Real Cat", category: "cozy", gradient: ["#6b4f3a", "#170f0a"],
    audioUrl: "https://cdn.pixabay.com/audio/2022/03/15/audio_77048d6dc3.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2020/08/02/46226-447422835_small.mp4",
    source: "Pixabay — real white cat by the window" },
  { id: "room", name: "Soft Room Ambience", category: "cozy", gradient: ["#4a3f3a", "#14100d"],
    audioUrl: "https://cdn.pixabay.com/audio/2026/08/04/audio_92ce9e946a.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2023/06/08/166272-834580690_large.mp4",
    source: "Pixabay — cozy room with candles" },

  // ── Focus ─────────────────────────────────────────────────────────────
  { id: "brownNoise", name: "Brown Noise", category: "focus", gradient: ["#5a4a3a", "#140f0a"],
    audioUrl: "https://cdn.pixabay.com/audio/2025/02/11/audio_076c4755e8.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2020/05/05/38137-415263669_large.mp4",
    source: "Pixabay — dark mist" },
  { id: "deepNoise", name: "Deep Noise", category: "focus", gradient: ["#2f3a4a", "#080b10"],
    audioUrl: "https://cdn.pixabay.com/audio/2025/01/28/audio_edc77fca75.mp3",
    videoUrl: "https://cdn.pixabay.com/video/2017/01/07/7102-198553608_large.mp4",
    source: "Pixabay — fog rolling" },
];

export function getAmbientSound(id: string | null): AmbientSound | undefined {
  if (!id) return undefined;
  return ambientSounds.find((s) => s.id === id);
}

export const ambientCategories = [
  { id: "nature" as const, label: "Nature" },
  { id: "cozy" as const, label: "Cozy" },
  { id: "focus" as const, label: "Focus" },
];
