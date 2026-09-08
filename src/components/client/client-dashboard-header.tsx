"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ClientDashboardHeaderProps {
  onOpenMobileMenu: () => void;
  className?: string;
}

export function ClientDashboardHeader({
  onOpenMobileMenu,
  className,
}: ClientDashboardHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex flex-col justify-center border-b border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)]/90 backdrop-blur-md transition-colors",
        className
      )}
    >
      {/* Top action bar: mobile trigger & client quick stats/actions */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 lg:py-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open client navigation menu"
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] active:scale-95 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>

          {/* Breadcrumb / Title indication on mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
              Dashboard
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Help / Docs Link */}
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-2 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <span>Back to Home</span>
          </Link>

          {/* Post a Project Primary CTA Button */}
          <Link
            href="/client/projects/new"
            className="inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-[var(--color-text-primary)] px-4 sm:px-5 text-[13px] sm:text-[14px] font-medium text-white shadow-xs transition-all duration-200 hover:bg-black hover:shadow-sm active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <span className="text-[16px] leading-none font-light">+</span>
            <span>Post a Project</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
