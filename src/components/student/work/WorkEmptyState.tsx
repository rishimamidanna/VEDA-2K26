"use client";

import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import type { WorkTab } from "./WorkTabs";

export function WorkEmptyState({ tab }: { tab: WorkTab }) {
  let title = "No projects found";
  let message = "You don't have any projects here yet.";
  const cta = "Find Projects";
  const href = "/student/projects";

  if (tab === "Active") {
    title = "No active projects";
    message = "You don't have any active projects yet.";
  } else if (tab === "Awaiting Review") {
    title = "No projects awaiting review";
    message = "You don't have any submissions waiting for client review.";
  } else if (tab === "Completed") {
    title = "No completed projects yet";
    message = "When you finish projects, they will appear here to add to your portfolio.";
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border-subtle)] border-dashed py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-canvas-surface)]">
        <Briefcase size={28} className="text-[var(--color-text-secondary)]" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      <p className="mb-6 text-sm text-[var(--color-text-secondary)] max-w-xs">
        {message}
      </p>
      <Link
        href={href}
        className="group flex items-center gap-2 rounded-xl bg-[var(--color-text-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-text-secondary)] transition-colors"
      >
        {cta}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
