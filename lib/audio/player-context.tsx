"use client";

/**
 * PlayerProvider — dual-layer audio state management.
 *
 * Layer 1 · Qur'an  → single <audio> for the current reciter+surah.
 * Layer 2 · Ambient → single looping <audio> for the selected atmosphere.
 *
 * The two layers are fully independent: turning the Qur'an OFF pauses only the
 * Qur'an layer (position preserved) while the rain keeps falling, and vice
 * versa. All state is persisted to localStorage (debounced) and restored on
 * return. Every play call originates from a user gesture, keeping browser
 * autoplay policies happy.
 *
 * Architecture notes:
 *  - Audio elements are created once on mount (no src → no network traffic)
 *    and all listeners are attached via effects with explicit deps, so the
 *    React Compiler can preserve memoization and listeners never go stale.
 *  - Two contexts: `PlayerContext` (settings + actions, stable) and
 *    `PlaybackContext` (currentTime/duration/playing — updates ~4×/sec).
 *    Only components that truly need the ticking clock subscribe to the
 *    playback context, so the 114-row surah list and ambient grid never
 *    re-render during playback.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getRecitation } from "@/data/generated";
import { getAmbientSound } from "@/data/ambientSounds";
import { DEFAULT_PREFS, loadPrefs, savePrefs, type PersistedPrefs } from "@/lib/storage";
import { clamp, rampVolume } from "@/lib/utils";
import type { RepeatMode, TransliterationStyle } from "@/lib/types";

interface PlayerContextValue {
  // Qur'an layer
  reciterId: string;
  surahId: number;
  quranEnabled: boolean;
  quranError: string | null;
  quranVolume: number;
  repeat: RepeatMode;
  autoNext: boolean;
  // Ambient layer
  soundId: string | null;
  ambientEnabled: boolean;
  ambientVolume: number;
  ambientMuted: boolean;
  ambientLoop: boolean;
  ambientError: string | null;
  // Reading
  showRecitation: boolean;
  transliterationStyle: TransliterationStyle;
  // Actions — Qur'an
  selectReciter: (id: string) => void;
  selectSurah: (id: number, autoplay?: boolean) => void;
  toggleQuran: () => void;
  playQuran: () => void;
  pauseQuran: () => void;
  nextSurah: () => void;
  prevSurah: () => void;
  seek: (t: number) => void;
  setQuranVolume: (v: number) => void;
  setRepeat: (m: RepeatMode) => void;
  setAutoNext: (v: boolean) => void;
  // Actions — Ambient
  selectAmbient: (id: string) => void;
  toggleAmbient: () => void;
  setAmbientVolume: (v: number) => void;
  toggleAmbientMute: () => void;
  setAmbientLoop: (v: boolean) => void;
  // Actions — Reading
  setShowRecitation: (v: boolean) => void;
  setTransliterationStyle: (s: TransliterationStyle) => void;
  dismissQuranError: () => void;
  dismissAmbientError: () => void;
}

interface PlaybackContextValue {
  currentTime: number;
  duration: number;
  quranPlaying: boolean;
  quranLoading: boolean;
  ambientPlaying: boolean;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);
const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  // Hydration safety: render children only after mount (no SSR/client mismatch
  // when localStorage prefs differ from server defaults).
  const mounted = useSyncExternalStore(
    (cb) => {
      queueMicrotask(cb);
      return () => {};
    },
    () => true,
    () => false,
  );
  const [prefs] = useState<PersistedPrefs>(() =>
    typeof window === "undefined" ? DEFAULT_PREFS : loadPrefs(),
  );

  const [reciterId, setReciterId] = useState(prefs.reciterId);
  const [surahId, setSurahId] = useState(prefs.surahId);
  const [soundId, setSoundId] = useState<string | null>(prefs.soundId);
  const [quranEnabled, setQuranEnabled] = useState(prefs.quranEnabled);
  const [quranPlaying, setQuranPlaying] = useState(false);
  const [quranLoading, setQuranLoading] = useState(false);
  const [quranError, setQuranError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(prefs.positionSeconds);
  const [duration, setDuration] = useState(0);
  const [quranVolume, setQuranVolumeState] = useState(prefs.quranVolume);
  const [repeat, setRepeatState] = useState<RepeatMode>(prefs.repeat);
  const [autoNext, setAutoNextState] = useState(prefs.autoNext);
  const [ambientEnabled, setAmbientEnabled] = useState(prefs.ambientEnabled);
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [ambientVolume, setAmbientVolumeState] = useState(prefs.ambientVolume);
  const [ambientMuted, setAmbientMuted] = useState(prefs.ambientMuted);
  const [ambientLoop, setAmbientLoopState] = useState(prefs.ambientLoop);
  const [ambientError, setAmbientError] = useState<string | null>(null);
  const [showRecitation, setShowRecitation] = useState(prefs.showRecitation);
  const [transliterationStyle, setTransliterationStyle] = useState<TransliterationStyle>(
    prefs.transliterationStyle,
  );

  /* ── Audio elements (created once; no src → no network until needed) ──── */
  const quranRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const positionRef = useRef(prefs.positionSeconds); // preserved position for ON/OFF resume
  const pendingSeekRef = useRef<number | null>(null); // seek once metadata loads
  const switchTokenRef = useRef(0); // guards ambient cross-fade races
  const ambientEnabledRef = useRef(prefs.ambientEnabled); // read inside async swap

  useEffect(() => {
    quranRef.current = new Audio();
    quranRef.current.preload = "metadata";
    ambientRef.current = new Audio();
    ambientRef.current.preload = "metadata";
    ambientRef.current.loop = true;
    return () => {
      quranRef.current?.pause();
      ambientRef.current?.pause();
      quranRef.current = null;
      ambientRef.current = null;
    };
  }, []);

  /* ── Qur'an layer listeners (fresh closures via deps) ─────────────────── */
  useEffect(() => {
    const el = quranRef.current;
    if (!el) return;
    const onTime = () => {
      setCurrentTime(el.currentTime);
      positionRef.current = el.currentTime; // keep resume position fresh
    };
    const onMeta = () => {
      setDuration(el.duration || 0);
      if (pendingSeekRef.current != null) {
        el.currentTime = pendingSeekRef.current;
        pendingSeekRef.current = null;
      } else if (positionRef.current > 0 && el.currentTime === 0) {
        el.currentTime = positionRef.current;
      }
    };
    const onPlaying = () => setQuranPlaying(true);
    const onPause = () => setQuranPlaying(false);
    const onWaiting = () => setQuranLoading(true);
    const onCanplay = () => setQuranLoading(false);
    const onError = () => {
      setQuranLoading(false);
      setQuranPlaying(false);
      setQuranError("Unable to load this recitation. Please try again or choose another source.");
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("playing", onPlaying);
    el.addEventListener("pause", onPause);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("canplay", onCanplay);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("canplay", onCanplay);
      el.removeEventListener("error", onError);
    };
  }, []);

  /* ── Ambient layer listeners ──────────────────────────────────────────── */
  useEffect(() => {
    const el = ambientRef.current;
    if (!el) return;
    const onPlaying = () => setAmbientPlaying(true);
    const onPause = () => setAmbientPlaying(false);
    const onError = () => {
      setAmbientPlaying(false);
      setAmbientError("Unable to load this ambient sound. Please choose another.");
    };
    el.addEventListener("playing", onPlaying);
    el.addEventListener("pause", onPause);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("error", onError);
    };
  }, []);

  /* ── Qur'an actions ───────────────────────────────────────────────────── */
  const loadQuranSource = useCallback(
    (reciter: string, surah: number, seekTo = 0) => {
      const rec = getRecitation(reciter, surah);
      const el = quranRef.current;
      if (!el || !rec) return;
      setQuranError(null);
      setQuranLoading(true);
      setQuranPlaying(false); // el.load() stops playback without a pause event
      el.src = rec.audioUrl;
      el.load();
      pendingSeekRef.current = seekTo > 0 ? seekTo : null;
      positionRef.current = seekTo;
      setCurrentTime(seekTo);
    },
    [],
  );

  const playQuran = useCallback(() => {
    const el = quranRef.current;
    if (!el) return;
    if (!el.src) loadQuranSource(reciterId, surahId, positionRef.current);
    el.volume = quranVolume;
    setQuranEnabled(true);
    setQuranError(null);
    el.play().catch(() => {
      /* autoplay-policy block — stay paused; user gesture will retry */
      setQuranPlaying(false);
    });
  }, [loadQuranSource, reciterId, surahId, quranVolume]);

  const pauseQuran = useCallback(() => {
    quranRef.current?.pause();
  }, []);

  /** QURAN ON/OFF — independent from ambient; resumes at preserved position. */
  const toggleQuran = useCallback(() => {
    const el = quranRef.current;
    if (quranEnabled) {
      if (el) {
        positionRef.current = el.currentTime;
        el.pause();
      }
      setQuranEnabled(false);
    } else {
      setQuranEnabled(true);
      playQuran();
    }
  }, [quranEnabled, playQuran]);

  const selectReciter = useCallback(
    (id: string) => {
      setReciterId(id);
      positionRef.current = 0;
      setSurahId(1);
      setCurrentTime(0);
      const el = quranRef.current;
      if (!el) return;
      loadQuranSource(id, 1, 0);
      if (quranEnabled) {
        el.play().catch(() => setQuranPlaying(false));
      }
    },
    [loadQuranSource, quranEnabled],
  );

  const selectSurah = useCallback(
    (id: number, autoplay = true) => {
      setSurahId(id);
      positionRef.current = 0;
      setCurrentTime(0);
      const el = quranRef.current;
      if (!el) return;
      loadQuranSource(reciterId, id, 0);
      if (autoplay) {
        // Explicit user intent — play regardless of the ON/OFF toggle.
        setQuranEnabled(true);
        el.play().catch(() => setQuranPlaying(false));
      }
    },
    [reciterId, loadQuranSource],
  );

  const goSurah = useCallback(
    (delta: number) => {
      const next = clamp(surahId + delta, 1, 114);
      if (next === surahId) return;
      selectSurah(next, true);
    },
    [surahId, selectSurah],
  );

  const nextSurah = useCallback(() => goSurah(1), [goSurah]);
  const prevSurah = useCallback(() => goSurah(-1), [goSurah]);

  /* ── Ended handler (re-subscribed so it always sees fresh state) ──────── */
  useEffect(() => {
    const el = quranRef.current;
    if (!el) return;
    const onEnded = () => {
      if (repeat === "one") {
        el.currentTime = 0;
        el.play().catch(() => undefined);
        return;
      }
      if (repeat === "all" || autoNext) {
        const next = surahId >= 114 ? 1 : surahId + 1;
        selectSurah(next, true);
        return;
      }
      setQuranPlaying(false);
    };
    el.addEventListener("ended", onEnded);
    return () => el.removeEventListener("ended", onEnded);
  }, [repeat, autoNext, surahId, selectSurah]);

  const seek = useCallback((t: number) => {
    const el = quranRef.current;
    positionRef.current = t;
    setCurrentTime(t);
    if (!el) return;
    if (el.readyState >= 1) el.currentTime = t;
    else pendingSeekRef.current = t;
  }, []);

  const setQuranVolume = useCallback((v: number) => {
    setQuranVolumeState(v);
    if (quranRef.current) quranRef.current.volume = v;
  }, []);

  const setRepeat = useCallback((m: RepeatMode) => setRepeatState(m), []);
  const setAutoNext = useCallback((v: boolean) => setAutoNextState(v), []);

  /* ── Ambient actions ──────────────────────────────────────────────────── */
  const selectAmbient = useCallback(
    (id: string) => {
      const sound = getAmbientSound(id);
      const el = ambientRef.current;
      if (!sound || !el) return;
      const token = ++switchTokenRef.current;
      const oldEl = ambientRef.current;

      const swap = () => {
        if (token !== switchTokenRef.current) return;
        setAmbientError(null);
        setSoundId(id);
        el.src = sound.audioUrl;
        el.load();
        el.loop = ambientLoop;
        el.volume = ambientMuted ? 0 : ambientVolume * (sound.volume ?? 1);
        // Read the LIVE enabled flag (not the value captured at click time)
        // so a mid-crossfade OFF toggle is respected.
        if (ambientEnabledRef.current) {
          el.play().catch(() => {
            /* resume on next gesture */
          });
        }
      };

      if (oldEl && !oldEl.paused && oldEl.src) {
        // Cross-fade: duck the old sound, then swap.
        rampVolume(oldEl, 0, 500).then(() => {
          oldEl.pause();
          swap();
        });
      } else {
        swap();
      }
    },
    [ambientLoop, ambientMuted, ambientVolume],
  );

  const toggleAmbient = useCallback(() => {
    const sound = getAmbientSound(soundId);
    const el = ambientRef.current;
    if (!sound || !el) return;
    if (ambientPlaying) {
      el.pause();
      setAmbientEnabled(false);
      ambientEnabledRef.current = false;
      return;
    }
    setAmbientError(null);
    if (!el.src) {
      el.src = sound.audioUrl;
      el.load();
    }
    el.loop = ambientLoop;
    el.volume = ambientMuted ? 0 : ambientVolume * (sound.volume ?? 1);
    setAmbientEnabled(true);
    ambientEnabledRef.current = true;
    el.play().catch(() => setAmbientPlaying(false));
  }, [soundId, ambientPlaying, ambientLoop, ambientMuted, ambientVolume]);

  const setAmbientVolume = useCallback(
    (v: number) => {
      setAmbientVolumeState(v);
      if (ambientRef.current && !ambientMuted) {
        const cur = getAmbientSound(soundId);
        rampVolume(ambientRef.current, v * (cur?.volume ?? 1), 300);
      }
    },
    [ambientMuted, soundId],
  );

  const toggleAmbientMute = useCallback(() => {
    setAmbientMuted((m) => {
      const next = !m;
      if (ambientRef.current) {
        const cur = getAmbientSound(soundId);
        rampVolume(ambientRef.current, next ? 0 : ambientVolume * (cur?.volume ?? 1), 250);
      }
      return next;
    });
  }, [ambientVolume]);

  const setAmbientLoop = useCallback((v: boolean) => {
    setAmbientLoopState(v);
    if (ambientRef.current) ambientRef.current.loop = v;
  }, []);

  /* ── Persistence (debounced ~1s; also on unload) ──────────────────────── */
  const stateRef = useRef<PersistedPrefs>({
    ...DEFAULT_PREFS,
    reciterId,
    surahId,
    soundId,
    quranVolume,
    ambientVolume,
    quranEnabled,
    ambientEnabled,
    repeat,
    autoNext,
    positionSeconds: prefs.positionSeconds,
    showRecitation,
    transliterationStyle,
    ambientMuted,
    ambientLoop,
  });
  useEffect(() => {
    stateRef.current = {
      ...stateRef.current,
      reciterId,
      surahId,
      soundId,
      quranVolume,
      ambientVolume,
      quranEnabled,
      ambientEnabled,
      repeat,
      autoNext,
      showRecitation,
      transliterationStyle,
      ambientMuted,
      ambientLoop,
    };
  }, [reciterId, surahId, soundId, quranVolume, ambientVolume, quranEnabled, ambientEnabled, repeat, autoNext, showRecitation, transliterationStyle, ambientMuted, ambientLoop]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const persist = () => savePrefs({ ...stateRef.current, positionSeconds: positionRef.current });
    const id = window.setInterval(persist, 1000);
    window.addEventListener("beforeunload", persist);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("beforeunload", persist);
    };
  }, []);

  const dismissQuranError = useCallback(() => setQuranError(null), []);
  const dismissAmbientError = useCallback(() => setAmbientError(null), []);

  const playerValue = useMemo<PlayerContextValue>(
    () => ({
      reciterId,
      surahId,
      quranEnabled,
      quranError,
      quranVolume,
      repeat,
      autoNext,
      soundId,
      ambientEnabled,
      ambientVolume,
      ambientMuted,
      ambientLoop,
      ambientError,
      showRecitation,
      transliterationStyle,
      selectReciter,
      selectSurah,
      toggleQuran,
      playQuran,
      pauseQuran,
      nextSurah,
      prevSurah,
      seek,
      setQuranVolume,
      setRepeat,
      setAutoNext,
      selectAmbient,
      toggleAmbient,
      setAmbientVolume,
      toggleAmbientMute,
      setAmbientLoop,
      setShowRecitation,
      setTransliterationStyle,
      dismissQuranError,
      dismissAmbientError,
    }),
    [reciterId, surahId, quranEnabled, quranError, quranVolume, repeat, autoNext,
      soundId, ambientEnabled, ambientVolume, ambientMuted, ambientLoop, ambientError,
      showRecitation, transliterationStyle, selectReciter, selectSurah, toggleQuran, playQuran,
      pauseQuran, nextSurah, prevSurah, seek, setQuranVolume, setRepeat, setAutoNext,
      selectAmbient, toggleAmbient, setAmbientVolume, toggleAmbientMute, setAmbientLoop,
      setShowRecitation, setTransliterationStyle, dismissQuranError, dismissAmbientError],
  );

  const playbackValue = useMemo<PlaybackContextValue>(
    () => ({ currentTime, duration, quranPlaying, quranLoading, ambientPlaying }),
    [currentTime, duration, quranPlaying, quranLoading, ambientPlaying],
  );

  if (!mounted) return null;

  return (
    <PlayerContext.Provider value={playerValue}>
      <PlaybackContext.Provider value={playbackValue}>{children}</PlaybackContext.Provider>
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

export function usePlayback(): PlaybackContextValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlayback must be used inside <PlayerProvider>");
  return ctx;
}