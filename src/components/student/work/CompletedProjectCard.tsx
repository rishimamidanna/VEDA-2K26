"use client";

import { motion } from "framer-motion";
import { ArrowRight, User2, Star, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { WorkProject, Project } from "@/types";

interface CompletedProjectCardProps {
  work: WorkProject;
  project: Project;
  index?: number;
}

export function CompletedProjectCard({ work, project, index = 0 }: CompletedProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className="group flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <CheckCircle2 size={14} />
            Completed: {work.completedAt}
          </div>
          <h3 className="mb-1.5 text-lg font-bold text-[var(--color-text-primary)] leading-snug">
            {project.title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
            <User2 size={14} />
            <span>Client: <span className="font-medium text-[var(--color-text-primary)]">{project.client}</span></span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1 sm:items-end flex-shrink-0">
          <span className="text-xl font-bold text-[var(--color-text-primary)]">{work.earnings}</span>
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Earnings</span>
        </div>
      </div>

      {(work.review || work.rating) && (
        <div className="my-2 rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-1 text-sm font-bold text-[var(--color-text-primary)]">
            {work.rating} <Star size={14} className="fill-current text-yellow-400" />
            <span className="ml-2 font-medium text-[var(--color-text-secondary)] text-xs">Client Review</span>
          </div>
          {work.review && (
            <p className="text-sm italic text-gray-700">&quot;{work.review}&quot;</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end pt-2">
        <Link
          href={`/student/projects/${project.id}`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border-subtle)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
        >
          View Project
        </Link>
        <button
          className="group/btn flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-text-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-text-secondary)] transition-colors"
        >
          Add to Portfolio
          <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  );
}
