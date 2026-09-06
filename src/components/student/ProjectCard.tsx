"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  title: string;
  budget: string;
  duration: string;
  match: number;
  skills: string[];
  category: string;
  index?: number;
}

export function ProjectCard({
  title,
  budget,
  duration,
  match,
  skills,
  category,
  index = 0,
}: ProjectCardProps) {
  const matchColor =
    match >= 93 ? "text-emerald-600 bg-emerald-50" :
    match >= 88 ? "text-blue-600 bg-blue-50" :
    "text-gray-600 bg-gray-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
      className="group flex flex-col gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-5 transition-shadow cursor-default"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="mb-1.5 inline-block rounded-md bg-[var(--color-canvas-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
            {category}
          </span>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] leading-snug">
            {title}
          </h3>
        </div>
        <span className={cn("flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", matchColor)}>
          {match}% Match
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
        <span className="font-semibold text-[var(--color-text-primary)]">{budget}</span>
        <span className="h-1 w-1 rounded-full bg-[var(--color-border-subtle)]" />
        <span>{duration}</span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-lg border border-[var(--color-border-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* CTA */}
      <button className="group/btn flex items-center gap-1.5 rounded-xl bg-[var(--color-canvas-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-white transition-all self-start">
        View Project
        <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
      </button>
    </motion.div>
  );
}
