"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FindTalentCardProps {
  className?: string;
}

export function FindTalentCard({ className }: FindTalentCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-gradient-to-br from-white via-white to-[#f5f5f7] p-6 sm:p-7 shadow-2xs transition-all hover:border-[var(--color-border-hover)] hover:shadow-xs",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3]">
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
              Find Talented Students
            </h3>
          </div>
          <p className="text-[13px] sm:text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
            Browse verified student freelancers skilled in design, engineering, content, and data. Discover motivated talent ready for your next project.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/client/dashboard#find-talent"
            className="inline-flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[var(--color-text-primary)] px-5 text-[13px] sm:text-[14px] font-medium text-white shadow-xs transition-all hover:bg-black hover:shadow-sm active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <span>Browse Talent</span>
            <span className="text-[14px]">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
