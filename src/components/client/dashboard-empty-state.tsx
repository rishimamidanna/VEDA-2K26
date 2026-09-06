"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface DashboardEmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function DashboardEmptyState({
  title,
  description,
  actionText,
  actionHref,
  icon,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-8 sm:p-12 text-center transition-colors hover:border-[var(--color-border-hover)]",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-canvas-surface)] text-[var(--color-text-tertiary)]">
          {icon}
        </div>
      )}

      <h4 className="text-[15px] sm:text-[16px] font-semibold text-[var(--color-text-primary)]">
        {title}
      </h4>

      <p className="mt-1.5 max-w-sm text-[13px] sm:text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        {description}
      </p>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-4 text-[13px] font-medium text-[var(--color-text-primary)] shadow-2xs transition-all hover:bg-[var(--color-canvas-surface)] hover:border-[var(--color-border-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
