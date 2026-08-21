"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BadgeCheck, Play } from "lucide-react";
import { reciters, getReciter } from "@/data/reciters";
import { usePlayer } from "@/lib/audio/player-context";
import { dict } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function ReciterCard({ reciterId }: { reciterId: string }) {
  const { reciterId: activeId, selectReciter, selectSurah } = usePlayer();
  const reciter = getReciter(reciterId)!;
  const active = activeId === reciter.id;

  const start = () => {
    if (!active) selectReciter(reciter.id);
    selectSurah(1, true);
    document.getElementById("now-playing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-500",
        active
          ? "border-gold/50 bg-white/[0.06] shadow-[0_0_80px_-24px_rgba(200,169,124,0.35)]"
          : "border-line bg-white/[0.03] hover:border-line hover:bg-white/[0.05] hover:shadow-card",
      )}
    >
      {/* Portrait / typographic card */}
      <div className="relative aspect-[3/4] w-full overflow-hidden sm:aspect-[4/3] lg:aspect-[3/3.2]">
        {reciter.image ? (
          <Image
            src={reciter.image}
            alt={reciter.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={reciter.id === "yasir-al-dawsari"}
            className="object-cover object-top transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="animate-shimmer flex h-full w-full flex-col items-center justify-center gap-6"
            style={{
              background:
                "radial-gradient(90% 90% at 50% 20%, rgba(200,169,124,0.16) 0%, rgba(21,21,28,0.9) 55%, #0b0b0f 100%)",
            }}
          >
            <span className="font-arabic text-6xl text-gold-soft sm:text-7xl">
              {reciter.arabicName}
            </span>
            <span className="text-xs tracking-[0.3em] text-mist-faint uppercase">Reciter</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-transparent to-transparent" />

        {active && (
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="glass absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-gold-soft"
          >
            <BadgeCheck className="h-3.5 w-3.5" /> {dict.reciters.select}
          </motion.span>
        )}
      </div>

      {/* Copy */}
      <div className="flex flex-1 flex-col gap-3 p-6 lg:p-7">
        <h3 className="font-display text-2xl text-mist">{reciter.name}</h3>
        <p className="text-sm leading-relaxed text-mist-dim">{reciter.bio}</p>

        <div className="mt-auto flex items-center gap-3 pt-4">
          <button
            onClick={start}
            className={cn(
              "flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300",
              active
                ? "bg-mist text-ink hover:scale-[1.03]"
                : "glass text-mist hover:border-gold/40 hover:text-gold-soft",
            )}
          >
            <Play className="h-4 w-4 fill-current" />
            {dict.reciters.listen}
          </button>
          <button
            onClick={() => selectReciter(reciter.id)}
            aria-pressed={active}
            className="rounded-full px-4 py-3 text-sm text-mist-dim transition-colors hover:text-mist"
          >
            {active ? dict.reciters.select : `Choose`}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function ReciterSelector() {
  return (
    <section id="reciters" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:py-28 lg:px-8 lg:py-36">
      <div className="mb-14 text-center">
        <h2 className="font-display text-4xl text-mist lg:text-5xl">{dict.reciters.title}</h2>
        <p className="mt-4 text-mist-dim">{dict.reciters.subtitle}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {reciters.map((r) => (
          <ReciterCard key={r.id} reciterId={r.id} />
        ))}
      </div>
    </section>
  );
}
