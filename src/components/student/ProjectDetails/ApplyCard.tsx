"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Project } from "@/types";

interface ApplyCardProps {
  project: Project;
  onApplyClick: () => void;
  hasApplied?: boolean;
}

export function ApplyCard({ project, onApplyClick, hasApplied = false }: ApplyCardProps) {
  const isClosed = project.status === "Closed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className="sticky top-24 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm"
    >
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{project.budget}</p>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Project Budget</p>
        </div>
        
        <div className="h-px w-full bg-[var(--color-border-subtle)]" />
        
        <div>
          <p className="text-lg font-semibold text-[var(--color-text-primary)]">{project.duration}</p>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Estimated Duration</p>
        </div>
        
        <div className="h-px w-full bg-[var(--color-border-subtle)]" />
        
        <div>
          <p className="text-lg font-semibold text-[var(--color-text-primary)]">{project.deadline || "TBD"}</p>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Deadline</p>
        </div>
      </div>

      {isClosed ? (
        <div className="rounded-xl bg-gray-100 p-4 text-center">
          <p className="text-sm font-semibold text-gray-700">Project Closed</p>
          <p className="mt-1 text-xs text-gray-500">This project is no longer accepting applications.</p>
        </div>
      ) : hasApplied ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-700">
              <CheckCircle2 size={16} />
              Applied
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              Shortlisted
            </span>
          </div>
          <button className="group flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition-colors shadow-sm">
            View Application
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            onClick={onApplyClick}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            Apply for this project
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-center text-xs text-[var(--color-text-secondary)]">
            Usually responds within 24 hours
          </p>
        </div>
      )}
    </motion.div>
  );
}
