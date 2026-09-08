"use client";

import { SearchX } from "lucide-react";

interface ProjectEmptyStateProps {
  onClear: () => void;
}

export function ProjectEmptyState({ onClear }: ProjectEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-canvas-surface)]">
        <SearchX size={28} className="text-[var(--color-text-secondary)]" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">
        No projects found
      </h3>
      <p className="mb-6 text-sm text-[var(--color-text-secondary)] max-w-xs">
        Try adjusting your filters or search terms.
      </p>
      <button
        onClick={onClear}
        className="rounded-xl bg-[var(--color-text-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-text-secondary)] transition-colors"
      >
        Clear filters
      </button>
    </div>
  );
}
