"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-canvas-bg)] px-4 py-16">
      <Container size="sm" className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-canvas-card)] px-3 py-1 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium tracking-wide text-[var(--color-text-secondary)]">
              Foundation ready.
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
            SkillBridge
          </h1>

          <p className="text-lg font-normal tracking-tight text-[var(--color-text-secondary)] sm:text-xl">
            Student Freelancer Marketplace
          </p>
        </motion.div>
      </Container>
    </main>
  );
}
