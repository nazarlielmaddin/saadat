"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { dict } from "@/lib/i18n";
import { DevelopedBy } from "@/components/DevelopedBy";

const ANFAL_AYAH = "The true believers are only those whose hearts tremble at the remembrance of Allah, whose faith increases when His revelations are recited to them, and who put their trust in their Lord.";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex max-w-4xl flex-col items-center"
      >
        <motion.h1
          variants={item}
          className="font-display text-glow-soft text-[clamp(1.5rem,5vw,4.25rem)] leading-[1.15] font-medium text-mist"
        >
          {dict.hero.titleA}
          <span className="text-gold">,</span>{" "}
          {dict.hero.titleB}
          <span className="text-gold">…</span>
        </motion.h1>

        <motion.p variants={item} className="mt-7 max-w-xl text-base leading-relaxed text-mist-dim sm:text-lg">
          {dict.hero.subtitle}
        </motion.p>

        <motion.blockquote
          variants={item}
          className="mt-8 max-w-2xl text-center text-gold italic text-base sm:text-lg"
        >
          <p className="mb-2">"&nbsp;{ANFAL_AYAH}&nbsp;"</p>
          <cite className="text-xs text-mist-faint">Surah Al-Anfal, 8:2</cite>
        </motion.blockquote>

        <motion.div variants={item} className="mt-9 flex flex-col items-center gap-4 sm:mt-11 sm:flex-row">
          <a
            href="#reciters"
            className="group relative overflow-hidden rounded-full bg-mist px-9 py-4 text-sm font-medium text-ink transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_50px_-12px_rgba(200,169,124,0.45)]"
          >
            {dict.hero.cta}
          </a>
          <a
            href="#surahs"
            className="glass rounded-full px-9 py-4 text-sm text-mist transition-all duration-300 hover:border-gold/40 hover:text-gold-soft"
          >
            {dict.hero.secondary}
          </a>
        </motion.div>

        <motion.div variants={item} className="mt-10">
          <DevelopedBy />
        </motion.div>
      </motion.div>

      <motion.a
        href="#reciters"
        aria-label="Scroll down"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-6 flex flex-col items-center gap-2 text-mist-faint transition-colors hover:text-mist sm:bottom-8"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </motion.a>
    </section>
  );
}
