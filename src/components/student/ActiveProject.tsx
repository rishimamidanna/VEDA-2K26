"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { activeProject } from "@/data/student";

export function ActiveProject() {
  return (
    <section className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="mb-4"
      >
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Active Work</h2>
        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
          Your current project in progress.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}
        className="rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 transition-shadow"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              {activeProject.title}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
              <Calendar size={13} />
              <span>Deadline: {activeProject.deadline}</span>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--color-text-secondary)]">Progress</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {activeProject.progress}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-canvas-surface)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${activeProject.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                />
              </div>
            </div>
          </div>

          <button className="group flex items-center gap-2 self-start rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-white hover:border-transparent transition-all sm:self-center flex-shrink-0">
            Continue working
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
