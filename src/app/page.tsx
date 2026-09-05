"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Hero, HowItWorks } from "@/components/sections";
import { BrandIntro, useIntroPhase } from "@/components/intro";

export default function Home() {
  const phase = useIntroPhase();
  const reduced = useReducedMotion();
  const isRevealed = phase !== "playing";

  return (
    <main className="flex-1">
      <BrandIntro />

      {/* Hero Reveal Container: synchronized crossfade with the intro exit */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 18, scale: 0.99 }}
        animate={
          isRevealed
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: reduced ? 0 : 18, scale: reduced ? 1 : 0.99 }
        }
        transition={{
          duration: reduced ? 0.45 : 0.85,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full origin-top"
      >
        <Hero />
      </motion.div>

      <HowItWorks />
    </main>
  );
}


