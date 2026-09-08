"use client";

import type { Project } from "@/types";

export function ProjectDescription({ project }: { project: Project }) {
  return (
    <div className="mb-10">
      <h2 className="mb-4 text-xl font-bold text-[var(--color-text-primary)]">
        Project Description
      </h2>
      <div className="prose prose-sm sm:prose-base prose-gray max-w-none text-[var(--color-text-secondary)]">
        <p className="leading-relaxed">
          {project.fullDescription || project.description}
        </p>
      </div>
    </div>
  );
}

export function ProjectDeliverables({ project }: { project: Project }) {
  if (!project.deliverables || project.deliverables.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="mb-6 text-xl font-bold text-[var(--color-text-primary)]">
        Deliverables
      </h2>
      <div className="flex flex-col gap-4">
        {project.deliverables.map((item, index) => (
          <div key={index} className="flex items-start gap-4 rounded-xl border border-[var(--color-border-subtle)] p-4">
            <span className="flex-shrink-0 text-sm font-bold text-[var(--color-text-tertiary)]">
              {(index + 1).toString().padStart(2, "0")}
            </span>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RequiredSkills({ project }: { project: Project }) {
  return (
    <div className="mb-10">
      <h2 className="mb-4 text-xl font-bold text-[var(--color-text-primary)]">
        Required Skills
      </h2>
      <div className="flex flex-wrap gap-2">
        {project.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)]"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
