"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, User2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Application, Project } from "@/types";
import { ProjectMatchBadge } from "@/components/student";
import { ApplicationProgress } from "./ApplicationProgress";

interface ApplicationCardProps {
  application: Application;
  project: Project;
  index?: number;
}

const statusStyles: Record<Application["status"], string> = {
  Accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Shortlisted: "bg-blue-50 text-blue-700 border-blue-100",
  Pending: "bg-gray-100 text-gray-600 border-gray-200",
  Rejected: "bg-red-50 text-red-700 border-red-100",
  "Under Review": "bg-purple-50 text-purple-700 border-purple-100",
  Withdrawn: "bg-gray-200 text-gray-700 border-gray-300",
};

export function ApplicationCard({ application, project, index = 0 }: ApplicationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className="group flex flex-col gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-5 sm:p-6 transition-shadow hover:shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-3">
            <span className="inline-block rounded-md bg-[var(--color-canvas-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
              {project.category}
            </span>
            <ProjectMatchBadge percentage={project.matchPercentage || 0} />
          </div>
          
          <h3 className="mb-1.5 text-lg font-semibold text-[var(--color-text-primary)] leading-snug">
            {project.title}
          </h3>
          
          <p className="mb-3 text-sm text-[var(--color-text-secondary)] line-clamp-2">
            {project.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold text-[var(--color-text-primary)]">{project.budget}</span>
            <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[var(--color-border-subtle)]" />
            <span className="text-[var(--color-text-secondary)]">{project.duration}</span>
            <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[var(--color-border-subtle)]" />
            <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
              <User2 size={14} />
              {project.client}
            </span>
            <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[var(--color-border-subtle)]" />
            <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
              <Clock size={14} />
              Applied {application.appliedAt}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", statusStyles[application.status])}>
            {application.status}
          </span>
          <Link
            href={`/student/applications/${application.id}`}
            className="group/btn flex items-center gap-1.5 rounded-xl bg-[var(--color-canvas-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-white transition-all"
          >
            View Details
            <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {application.status !== "Rejected" && (
        <div className="mt-2 border-t border-[var(--color-border-subtle)] pt-4">
          <ApplicationProgress status={application.status} />
        </div>
      )}
    </motion.div>
  );
}
