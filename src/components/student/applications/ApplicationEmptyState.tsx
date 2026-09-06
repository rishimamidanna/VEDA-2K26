"use client";

import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import type { ApplicationTab } from "./ApplicationTabs";

export function ApplicationEmptyState({ tab }: { tab: ApplicationTab }) {
  let title = "No applications found";
  let message = "You haven't applied to any projects yet.";

  if (tab === "Pending") {
    title = "No pending applications";
    message = "You don't have any pending applications at the moment.";
  } else if (tab === "Shortlisted") {
    title = "No shortlisted applications";
    message = "You don't have any shortlisted applications yet.";
  } else if (tab === "Accepted") {
    title = "No accepted applications";
    message = "You don't have any accepted applications yet.";
  } else if (tab === "Rejected") {
    title = "No rejected applications";
    message = "None of your applications have been rejected.";
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border-subtle)] border-dashed py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-canvas-surface)]">
        <Inbox size={28} className="text-[var(--color-text-secondary)]" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      <p className="mb-6 text-sm text-[var(--color-text-secondary)] max-w-xs">
        {message}
      </p>
      <Link
        href="/student/projects"
        className="group flex items-center gap-2 rounded-xl bg-[var(--color-text-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-text-secondary)] transition-colors"
      >
        Explore Projects
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
