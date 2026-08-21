"use client";

/**
 * AmbientBackground — renders ONLY the currently selected atmosphere video.
 * One video element at a time (src swaps with a gentle fade), muted + looped,
 * behind a cinematic dark overlay so it never distracts from the Qur'an.
 */
import { useState } from "react";
import { getAmbientSound } from "@/data/ambientSounds";
import { usePlayer } from "@/lib/audio/player-context";
import { dict } from "@/lib/i18n";

export function AmbientBackground() {
  const { soundId } = usePlayer();
  const sound = getAmbientSound(soundId);
  // Track which sound's video failed — a failure never poisons other sounds.
  const [failedId, setFailedId] = useState<string | null>(null);
  const videoFailed = failedId === soundId;

  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden bg-ink">
      {sound?.videoUrl && !videoFailed ? (
        <video
          key={sound.id}
          src={sound.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="video-fade-in h-full w-full object-cover"
          onError={() => setFailedId(sound.id)}
        />
      ) : (
        <div
          className="animate-shimmer h-full w-full"
          style={{
            background: sound
              ? `radial-gradient(120% 120% at 50% 20%, ${sound.gradient[0]}66 0%, ${sound.gradient[1]} 70%, #08080b 100%)`
              : "radial-gradient(120% 120% at 50% 10%, #141420 0%, #0a0a10 55%, #08080b 100%)",
          }}
        />
      )}

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/35 to-ink" />
      <div className="absolute inset-0 bg-[radial-gradient(85%_70%_at_50%_45%,transparent_0%,rgba(8,8,11,0.55)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink to-transparent" />

      {videoFailed && (
        <p className="sr-only">{dict.errors.video}</p>
      )}
    </div>
  );
}
