"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectMatchBadge } from "@/components/student";
import type { Project } from "@/types";

export function ProjectHeader({ project }: { project: Project }) {
  return (
    <div className="mb-8">
      <Link
        href="/student/projects"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </Link>
      
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <span className="inline-block rounded-md bg-[var(--color-canvas-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
          {project.category}
        </span>
        <ProjectMatchBadge percentage={project.matchPercentage || 0} />
      </div>

      <h1 className="mb-4 text-3xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
        {project.title}
      </h1>

      <p className="text-lg text-[var(--color-text-secondary)]">
        {project.description}
      </p>
    </div>
  );
}
