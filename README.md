# Saadat — Qur'an. Peace. Focus.

A premium digital sanctuary for Qur'an listening, relaxation, sleep, and reflection.

Choose a reciter, select an atmosphere, and listen in peace — with a fully independent
two-layer audio system, verse-synchronized Latin transliteration, cinematic ambient
backgrounds, and a floating premium player that remembers everything.

Built with **Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion**.

---

## ✨ Features

- **Two reciters** — Yasir Al-Dawsari & Haitham Al-Dakhin (114 surahs each, 228 recitations)
- **Dual-layer audio** — Qur'an and ambient sound play simultaneously but are fully
  independent: QURAN OFF pauses only the Qur'an (position preserved) while the rain
  keeps falling; QURAN ON resumes exactly where you left off. The same logic works in
  reverse for the ambient layer.
- **Verse-synchronized transliteration** — Latin-script reading (never Arabic) with
  automatic verse highlighting for Yasir Al-Dawsari (real timestamps), tap-to-jump,
  and an Accurate ⇄ Simple transliteration toggle.
- **16 ambient atmospheres** — Nature, Cozy, and Focus categories with matching
  cinematic background videos (only the selected video is ever loaded).
- **Premium floating player** — track info, transport, progress, independent volume
  sliders, ON/OFF toggles, playback speed, repeat, auto-next, and a calm waveform.
- **LocalStorage persistence** — reciter, surah, ambient sound, volumes, toggles,
  speed, repeat, and playback position are restored on return.
- **Error handling** — broken media shows a clean message instead of crashing.
- **Accessible** — keyboard navigation, focus rings, ARIA labels, reduced-motion support.
- **i18n-ready** — all UI strings live in one dictionary (`lib/i18n.ts`).

---

## 🚀 Getting started

### Prerequisites

- Node.js ≥ 20 (tested on v25)
- npm ≥ 10

### Install

```bash
git clone <your-repo> saadat
cd saadat
npm install
```

### Run (development)

```bash
npm run dev
# http://localhost:3000
```

### Build & run (production)

```bash
npm run build
npm start
# http://localhost:3000
```

### Regenerate data (optional)

The data layer is generated from live public APIs. To refresh it:

```bash
node scripts/fetch-data.mjs
```

This fetches surah metadata + transliteration from alquran.cloud and regenerates the
recitation catalog and verse timings. Requires network access.

### Environment variables

None are required. The app is fully static and works out of the box.

| Variable | Purpose | Required |
| --- | --- | --- |
| — | — | No environment variables are needed |

---

## 📁 Folder structure

```
saadat/
├── app/
│   ├── layout.tsx            # Root layout, fonts, PlayerProvider
│   ├── page.tsx              # Single-page sanctuary (hero → reciters → surahs → atmosphere → recitation)
│   └── globals.css           # Design tokens, glass surfaces, animations, sliders
├── components/
│   ├── AmbientBackground.tsx # Only the selected atmosphere video, dark overlay, fallback
│   ├── AmbientSelector.tsx   # Category-grouped ambient sound grid
│   ├── AmbientCard.tsx       # (inline) CSS-art thumbnail + play/pause + active state
│   ├── Footer.tsx            # Attribution & media sources
│   ├── Header.tsx            # Glass nav with anchor links
│   ├── Hero.tsx              # Cinematic hero: "Qur'an. Peace. Focus."
│   ├── PlayerBar.tsx         # Floating premium player (sticky on mobile)
│   ├── RecitationView.tsx    # Transliteration reader with verse sync + show/hide
│   ├── ReciterSelector.tsx   # Reciter cards (portrait or typographic)
│   ├── SettingsPopover.tsx   # Speed, repeat, auto-next, transliteration style
│   ├── SurahBrowser.tsx      # Searchable 114-surah list
│   ├── Toggle.tsx            # Accessible switch
│   ├── VolumeControl.tsx     # Icon + slim slider
│   ├── Waveform.tsx          # Calm equalizer animation
│   └── icons.tsx             # Brand SVG icons
├── data/
│   ├── reciters.ts           # Reciter catalog (id, name, image, bio)
│   ├── ambientSounds.ts      # 16 sounds (audio + video + gradient art)
│   ├── sources.ts            # Attribution registry for every external asset
│   ├── transliterations.ts   # Transliteration loader + accurate/simple styles
│   ├── generated.ts          # Typed wrappers over generated data
│   └── generated/            # Generated at build time (do not edit by hand)
│       ├── surahs.ts         # 114 surahs (EN/AZ/transliterated names, verses)
│       ├── recitations.ts    # 228 reciter×surah entries with CDN audio URLs
│       └── timings.ts        # Verse start offsets (ms) for Dawsari
├── lib/
│   ├── audio/
│   │   └── player-context.tsx # Dual-layer audio state machine (the heart)
│   ├── i18n.ts               # UI string dictionary (EN default, extensible)
│   ├── storage.ts            # Versioned localStorage persistence
│   ├── types.ts              # Domain types
│   └── utils.ts              # formatTime, clamp, rampVolume, activeVerseIndex
├── public/
│   ├── data/transliterations.json  # 6236 verses (fetched lazily at runtime)
│   └── images/reciters/            # Reciter portraits
├── scripts/
│   └── fetch-data.mjs        # Data generator (alquran.cloud + timings)
└── types/
    └── json.d.ts             # JSON module declarations
```

---

## 🎧 How the audio state management works

The system lives in `lib/audio/player-context.tsx` and is built around **two independent
`HTMLAudioElement`s** created once on mount (no `src` → zero network traffic until needed).

### Layer 1 — Qur'an

- One `<audio>` element whose `src` is the current reciter+surah MP3 (streamed from CDN).
- `quranEnabled` is the **ON/OFF switch**: turning it OFF pauses the element and stores
  `positionRef.current`; turning it ON calls `play()` again — the browser resumes from
  the stored `currentTime` automatically.
- `timeupdate` keeps both `currentTime` state and `positionRef` fresh (so a reload
  resumes mid-surah).
- `ended` is handled by a re-subscribed effect that reads fresh `repeat` / `autoNext` /
  `surahId` state: `repeat=one` replays the surah, `repeat=all` or `autoNext` advances
  to the next surah (wrapping at 114), otherwise playback stops.
- Playback speed is applied via `playbackRate`; seeking before metadata loads is queued
  in `pendingSeekRef` and applied on `loadedmetadata`.

### Layer 2 — Ambient

- One looping `<audio>` element. Selecting a sound swaps the `src` with a **500 ms
  volume cross-fade** (old sound ducks to 0, then the new one fades in at the ambient
  volume). A token guard (`switchTokenRef`) prevents race conditions when switching
  sounds rapidly.
- `ambientEnabled` is the ON/OFF switch — it pauses/resumes only the ambient layer.
  A live ref (`ambientEnabledRef`) is read inside the async cross-fade so a mid-fade
  OFF toggle is always respected.
- Mute, loop, and volume are independent of the Qur'an layer.

### Persistence

Every second (and on `beforeunload`) the current state is written to
`localStorage["saadat:prefs:v1"]`. On return, the provider restores reciter, surah,
ambient sound, volumes, toggles, speed, repeat, and playback position. A hydration
gate (`useSyncExternalStore`) prevents SSR/client mismatches.

### Autoplay policy

No audio starts automatically. Every `play()` call originates from a user gesture
(clicking a surah, the player, or an ambient card). The first pointer interaction
pre-creates the audio elements so subsequent playback starts instantly.

---

## 🧩 Adding a new reciter

1. **Add the reciter** to `data/reciters.ts`:

   ```ts
   {
     id: "abdulbasit",            // unique slug
     name: "Abdul Basit",
     arabicName: "عبد الباسط",
     image: "/images/reciters/abdulbasit.jpg", // or omit for a typographic card
     bio: "Short bio…",
     bioLong: "Longer bio…",
     hasTimestamps: false,        // true only if you ship verse timings
     origin: "Egypt",
   }
   ```

2. **Add 114 recitations** to the generator (`scripts/fetch-data.mjs`) or directly to
   `data/generated/recitations.ts`:

   ```ts
   { id: "abdulbasit-001", reciterId: "abdulbasit", surahId: 1,
     audioUrl: "https://<cdn>/abdulbasit/1.mp3", durationSeconds: null, source: "…" }
   ```

   The URL pattern is deterministic — a simple loop over 1–114 is enough.

3. **Optional:** add verse timings to `data/generated/timings.ts` (keyed by surah
   number, ms offsets per verse) and set `hasTimestamps: true` to enable verse sync.

4. Restart the app. The reciter card appears automatically — no component changes needed.

---

## 🧩 Adding a new ambient sound

1. Add an entry to `data/ambientSounds.ts`:

   ```ts
   {
     id: "campfire",              // unique slug
     name: "Campfire",
     category: "cozy",            // "nature" | "cozy" | "focus"
     audioUrl: "https://cdn.pixabay.com/audio/…/audio_xxx.mp3",  // verified MP3
     videoUrl: "https://cdn.pixabay.com/video/…/xxx.mp4",        // verified MP4
     gradient: ["#7a3b1a", "#140a04"],  // CSS-art thumbnail colors
     source: "Pixabay — description",
   }
   ```

2. (Optional) add an icon to the `ICONS` map in `components/AmbientSelector.tsx`.

3. The card, background video, and audio layer all pick it up automatically.

> **Tip:** verify URLs before shipping — `curl -sI -L <url>` should return `HTTP 200`
> with the correct `Content-Type` (`audio/mpeg` / `video/mp4`).

---

## 🧩 Adding new surahs

The full 114-surah canon is already included. If you ever need to extend the dataset:

1. Edit the name maps (`AZ` / `TRANS`) in `scripts/fetch-data.mjs`.
2. Run `node scripts/fetch-data.mjs` — it re-fetches metadata and regenerates
   `data/generated/surahs.ts` + `recitations.ts` for every reciter automatically.

---

## 🔗 Data & API sources

| Asset | Source | License |
| --- | --- | --- |
| Dawsari audio (128 kbps, full surahs) | `cdn.islamic.network/quran/audio-surah/128/ar.yasseraldossari/{1-114}.mp3` | Islamic Network CDN (quranicaudio.com archive) |
| Al-Dakhin audio (Hafs, 320 kbps) | `server16.mp3quran.net/h_dukhain/Rewayat-Hafs-A-n-Assem/{001-114}.mp3` | mp3quran.net official mushaf |
| Surah metadata + transliteration | `api.alquran.cloud/v1/surah` · `api.alquran.cloud/v1/quran/en.transliteration` | alquran.cloud (Qur'an text is public domain in most jurisdictions) |
| Verse timings (Dawsari) | `everyayah.com/data/timings_files/Yasser_Ad-Dussary_128kbps.zip` | © VerseByVerseQuran.com — link-back required (included in footer) |
| Reciter portrait (Dawsari) | Wikimedia Commons (`Yasser_Al-Dosari (cropped).jpg`) | CC BY-SA 4.0 |
| Ambient audio + background videos (16) | Pixabay CDN | Pixabay Content License (free, no attribution required) |

All sources are tracked in `data/sources.ts` and shown in the footer.

---

## 🧭 Product principles

- **Calm over loud** — muted gold accents, deep charcoal surfaces, generous whitespace.
- **One video at a time** — only the selected atmosphere's video is mounted.
- **Honest sync** — verse highlighting only where real timestamps exist (Dawsari);
  Al-Dakhin falls back to scrollable text, ready for timestamps later.
- **Extensible** — data is separated from UI; reciters, sounds, translations, and
  languages can be added without touching components.

---

## 📄 License

Code: MIT. Media assets remain the property of their respective owners (see
`data/sources.ts`). The Qur'an text is public domain in most jurisdictions.