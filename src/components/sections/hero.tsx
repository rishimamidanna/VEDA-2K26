"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Container } from "@/components/layout";
import { HeroVisual } from "./hero-visual";

const MotionLink = motion.create(Link);

export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const reveal = (delay: number) => ({
    initial: reduced ? false as const : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.65, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  });
  return (
    <section
      ref={ref}
      aria-label="Hero"
      className="relative w-full overflow-hidden bg-[var(--color-canvas-bg)] pt-6 pb-2 sm:pt-8 sm:pb-2 lg:pt-8 lg:pb-2"
    >
      <Container size="xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Left Column: Hero Content */}
          <motion.div style={{ y: reduced ? 0 : copyY }} className="flex flex-col items-start lg:col-span-6 xl:col-span-6">
            {/* Eyebrow */}
            <motion.div {...reveal(0.08)} className="mb-4 sm:mb-6">
              <span className="text-[11px] sm:text-[12px] font-semibold tracking-[0.2em] text-[#5c5c62] uppercase">
                Skills today. Opportunities tomorrow.
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 {...reveal(0.15)} className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-semibold tracking-[-0.035em] leading-[1.08] text-[var(--color-text-primary)]">
              <span className="text-[var(--color-text-primary)]">Real projects.</span>
              <br />
              <span className="text-[var(--color-text-primary)]">Real experience.</span>
              <br />
              <span className="bg-gradient-to-r from-[#5a6ef5] via-[#7870f5] to-[#9c71f7] bg-clip-text text-transparent transition-colors duration-300">
                A brighter you.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p {...reveal(0.22)} className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-[18px] text-[#48484a] leading-relaxed max-w-xl">
              SkillBridge connects talented students with real-world projects.
              Gain experience, build your portfolio, and work with clients who
              value your skills.
            </motion.p>

            {/* CTAs */}
            <motion.div {...reveal(0.29)} className="mt-8 flex w-full flex-col sm:w-auto sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <MotionLink
                href="#projects"
                whileHover={reduced ? undefined : { y: -1 }}
                whileTap={reduced ? undefined : { scale: 0.985 }}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-text-primary)] px-7 text-[15px] font-medium text-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200 ease-out hover:bg-black hover:shadow-[0_4px_14px_rgba(0,0,0,0.14)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 motion-safe:active:scale-[0.985]"
              >
                <span>Find Projects</span>
                <span className="transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-[3px]">
                  →
                </span>
              </MotionLink>

              <MotionLink
                href="/client/login"
                whileHover={reduced ? undefined : { y: -1 }}
                whileTap={reduced ? undefined : { scale: 0.985 }}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#e5e5ea] bg-white px-7 text-[15px] font-medium text-[var(--color-text-primary)] shadow-xs transition-all duration-200 ease-out hover:border-[#c7c7cc] hover:bg-[#f5f5f7] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 motion-safe:active:scale-[0.985]"
              >
                Hire Students
              </MotionLink>
            </motion.div>

            {/* Truthful Value Statement */}
            <motion.div {...reveal(0.36)} className="mt-4 sm:mt-5 flex items-center gap-2">
              <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3]" aria-hidden="true">
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </span>
              <p className="text-[13px] sm:text-[13.5px] font-medium text-[#5c5c62]">
                Build skills through real-world projects
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column: Product Visual Composition */}
          <motion.div style={{ y: reduced ? 0 : visualY }} className="w-full lg:col-span-6 xl:col-span-6">
            <HeroVisual />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
