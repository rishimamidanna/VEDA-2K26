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
      className="relative w-full overflow-hidden bg-[var(--color-canvas-bg)] pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24"
    >
      <Container size="xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Left Column: Hero Content */}
          <motion.div style={{ y: reduced ? 0 : copyY }} className="flex flex-col items-start lg:col-span-6 xl:col-span-6">
            {/* Eyebrow */}
            <motion.div {...reveal(0.08)} className="mb-4 sm:mb-6">
              <span className="text-[11px] sm:text-[12px] font-semibold tracking-[0.2em] text-[var(--color-text-secondary)] uppercase">
                Skills today. Opportunities tomorrow.
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 {...reveal(0.15)} className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[60px] font-semibold tracking-[-0.035em] leading-[1.08] text-[var(--color-text-primary)]">
              <span>Real projects.</span>
              <br />
              <span>Real experience.</span>
              <br />
              <span className="text-[var(--color-text-tertiary)] transition-colors duration-300">
                A brighter you.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p {...reveal(0.22)} className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-[18px] text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
              SkillBridge connects talented students with real-world projects.
              Gain experience, build your portfolio, and work with clients who
              value your skills.
            </motion.p>

            {/* CTAs */}
            <motion.div {...reveal(0.29)} className="mt-8 flex w-full flex-col sm:w-auto sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <MotionLink
                href="#projects"
                whileHover={reduced ? undefined : { y: -2 }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-text-primary)] px-7 text-[15px] font-medium text-white shadow-xs transition-colors duration-200 hover:bg-black hover:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                <span>Find Projects</span>
                <span className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5">
                  →
                </span>
              </MotionLink>

              <MotionLink
                href="#hire"
                whileHover={reduced ? undefined : { y: -1 }}
                whileTap={reduced ? undefined : { scale: 0.99 }}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white/70 px-7 text-[15px] font-medium text-[var(--color-text-primary)] backdrop-blur-xs transition-colors duration-200 hover:border-[var(--color-border-hover)] hover:bg-white hover:shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                Hire Students
              </MotionLink>
            </motion.div>

            {/* Student Proof Badges */}
            <motion.div {...reveal(0.36)} className="mt-8 sm:mt-10 flex items-center gap-3.5">
              {/* Overlapping student avatar placeholders */}
              <div className="flex -space-x-2.5 overflow-hidden py-0.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-[11px] font-medium text-white ring-2 ring-white shadow-xs">
                  AR
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-[11px] font-medium text-white ring-2 ring-white shadow-xs">
                  SK
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 text-[11px] font-medium text-white ring-2 ring-white shadow-xs">
                  NL
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-400 to-violet-600 text-[11px] font-medium text-white ring-2 ring-white shadow-xs">
                  DJ
                </span>
              </div>

              {/* Text */}
              <p className="text-[13px] sm:text-[14px] font-medium text-[var(--color-text-secondary)]">
                Join <span className="font-semibold text-[var(--color-text-primary)]">10,000+</span> students building their future
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column: 3D Product Visual Composition */}
          <motion.div style={{ y: reduced ? 0 : visualY }} className="w-full lg:col-span-6 xl:col-span-6">
            <HeroVisual />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
