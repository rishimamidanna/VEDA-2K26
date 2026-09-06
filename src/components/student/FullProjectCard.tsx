"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, User2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectMatchBadge } from "./ProjectMatchBadge";
import type { Project } from "@/types";

interface FullProjectCardProps {
  project: Project;
  index?: number;
}

const categoryColors: Record<string, string> = {
  "Web Development":    "bg-blue-50 text-blue-700",
  "Mobile Development": "bg-indigo-50 text-indigo-700",
  "UI/UX Design":       "bg-purple-50 text-purple-700",
  "Data Science":       "bg-cyan-50 text-cyan-700",
  "AI/ML":              "bg-violet-50 text-violet-700",
  "Content":            "bg-amber-50 text-amber-700",
  "Automation":         "bg-orange-50 text-orange-700",
};

const levelColors: Record<string, string> = {
  Beginner:     "text-emerald-700 bg-emerald-50",
  Intermediate: "text-blue-700 bg-blue-50",
  Advanced:     "text-violet-700 bg-violet-50",
};

export function FullProjectCard({ project, index = 0 }: FullProjectCardProps) {
  const catColor = categoryColors[project.category] ?? "bg-gray-100 text-gray-600";
  const lvlColor = levelColors[project.experienceLevel] ?? "bg-gray-100 text-gray-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.07)" }}
      className="group flex flex-col gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-5 transition-shadow"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className={cn("inline-block self-start rounded-md px-2 py-0.5 text-[11px] font-semibold", catColor)}>
            {project.category}
          </span>
          <h3 className="text-base font-semibold leading-snug text-[var(--color-text-primary)]">
            {project.title}
          </h3>
        </div>
        <ProjectMatchBadge percentage={project.matchPercentage || 0} className="flex-shrink-0 mt-0.5" />
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">
        {project.description}
      </p>

      {/* Budget + Duration */}
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold text-[var(--color-text-primary)]">{project.budget}</span>
        <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[var(--color-border-subtle)]" />
        <span className="text-[var(--color-text-secondary)]">{project.duration}</span>
        <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[var(--color-border-subtle)]" />
        <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", lvlColor)}>
          {project.experienceLevel}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {project.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-lg border border-[var(--color-border-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border-subtle)] mt-auto">
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1">
            <User2 size={12} />
            {project.client}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {project.postedAt}
          </span>
        </div>

        <Link
          href={`/student/projects/${project.id}`}
          className="group/btn flex items-center gap-1.5 rounded-xl bg-[var(--color-canvas-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-white transition-all"
        >
          View Project
          <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}
