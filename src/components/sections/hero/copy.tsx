"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function HeroCopy() {
  return (
    <div className="flex flex-col items-start justify-center pt-10 pb-16 md:pt-20 md:pb-24 z-10 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-6 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-canvas-subtle)] px-4 py-1.5"
      >
        <span className="text-xs font-semibold tracking-widest text-[var(--color-text-secondary)]">
          SKILLS TODAY. OPPORTUNITIES TOMORROW.
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-6 text-5xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-6xl md:text-7xl lg:leading-[1.1]"
      >
        Real projects.
        <br />
        Real experience.
        <br />
        <span className="bg-gradient-to-r from-[#7C8CFF] to-[#A78BFA] bg-clip-text text-transparent">
          A brighter you.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-10 max-w-lg text-lg text-[var(--color-text-secondary)] sm:text-xl"
      >
        Build skills through real-world projects. Join the marketplace designed specifically for students to gain experience and earn.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center w-full sm:w-auto"
      >
        <a
          href="#projects"
          className="group flex items-center justify-center gap-2 rounded-full bg-[var(--color-text-primary)] px-8 py-3.5 text-sm font-medium text-[var(--color-canvas-bg)] hover:bg-[var(--color-text-secondary)] transition-colors w-full sm:w-auto"
        >
          Find Projects
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
        <a
          href="#talent"
          className="flex items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-transparent px-8 py-3.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-subtle)] transition-colors w-full sm:w-auto"
        >
          Hire Students
        </a>
      </motion.div>
    </div>
  );
}
