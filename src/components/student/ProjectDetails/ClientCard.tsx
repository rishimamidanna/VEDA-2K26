"use client";

import { ArrowRight, Star } from "lucide-react";
import type { Project } from "@/types";

export function ClientCard({ project }: { project: Project }) {
  const details = project.clientDetails || {
    type: "Business",
    location: "Global",
    projectsPosted: 1,
    studentsHired: 0,
    rating: 0,
  };

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-xl font-bold text-[var(--color-text-primary)]">
        About the Client
      </h2>
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] p-6">
        <div className="mb-6 flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-6">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {project.client}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {details.type} • {details.location}
            </p>
          </div>
          {details.rating > 0 && (
            <div className="flex flex-col items-end">
              <span className="flex items-center gap-1 text-sm font-bold text-[var(--color-text-primary)]">
                {details.rating} <Star size={14} className="fill-current text-yellow-400" />
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">Client Rating</span>
            </div>
          )}
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-semibold text-[var(--color-text-primary)]">
              {details.projectsPosted}
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
              Projects Posted
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-[var(--color-text-primary)]">
              {details.studentsHired}
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
              Students Hired
            </p>
          </div>
        </div>

        <button className="group flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border-subtle)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] transition-colors">
          View Client Profile
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
