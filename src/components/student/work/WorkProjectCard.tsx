"use client";

import { motion } from "framer-motion";
import { ArrowRight, User2, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { WorkProject, Project } from "@/types";
import { WorkProjectProgress } from "./WorkProjectProgress";

interface WorkProjectCardProps {
  work: WorkProject;
  project: Project;
  index?: number;
}

const statusStyles: Record<WorkProject["status"], string> = {
  "In Progress": "bg-blue-50 text-blue-700 border-blue-100",
  "Awaiting Review": "bg-purple-50 text-purple-700 border-purple-100",
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export function WorkProjectCard({ work, project, index = 0 }: WorkProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className="group flex flex-col gap-5 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <span className="mb-2 inline-block rounded-md bg-[var(--color-canvas-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
            {project.category}
          </span>
          <h3 className="mb-1.5 text-lg font-bold text-[var(--color-text-primary)] leading-snug">
            {project.title}
          </h3>
          <div className="mb-3 flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
            <User2 size={14} />
            <span>Client: <span className="font-medium text-[var(--color-text-primary)]">{project.client}</span></span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold text-[var(--color-text-primary)]">{project.budget}</span>
            <span className="h-1 w-1 rounded-full bg-[var(--color-border-subtle)]" />
            <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
              <Clock size={14} />
              Deadline: <span className="font-medium text-[var(--color-text-primary)]">{project.deadline}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end flex-shrink-0">
          <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", statusStyles[work.status])}>
            {work.status}
          </span>
          {work.status === "Awaiting Review" ? (
            <Link
              href={`/student/work/${work.id}`}
              className="group/btn flex items-center gap-1.5 rounded-xl border border-[var(--color-border-subtle)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
            >
              View Submission
              <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          ) : (
            <Link
              href={`/student/work/${work.id}`}
              className="group/btn flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Continue Working
              <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
        {project.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
            {skill}
          </span>
        ))}
        {project.skills.length > 4 && (
          <span className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
            +{project.skills.length - 4}
          </span>
        )}
      </div>

      <div className="rounded-xl bg-[var(--color-canvas-surface)] p-4">
        <WorkProjectProgress progress={work.progress} />
        <p className="mt-3 text-xs italic text-[var(--color-text-secondary)]">
          Last activity: {work.lastActivity}
        </p>
      </div>
    </motion.div>
  );
}
