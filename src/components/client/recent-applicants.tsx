"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ApplicantPreviewItem {
  id: string;
  name: string;
  avatarInitials: string;
  role: string;
  skills: string[];
  projectAppliedFor: string;
  matchScore: string;
}

export interface RecentApplicantsProps {
  applicants?: ApplicantPreviewItem[];
  className?: string;
}

export function RecentApplicants({
  applicants = [],
  className,
}: RecentApplicantsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2
              id="recent-applicants-heading"
              className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text-primary)]"
            >
              Recent Applicants
            </h2>
            <span className="inline-flex items-center rounded-full bg-[#0071e3]/10 px-2 py-0.5 text-[11px] font-medium text-[#0071e3]">
              Sample preview
            </span>
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            Review candidate applications and portfolios for your posted projects.
          </p>
        </div>

        {applicants.length > 0 && (
          <Link
            href="/client/dashboard#applicants"
            className="text-[13px] font-medium text-[#0071e3] hover:underline focus-visible:outline-hidden"
          >
            View all &rarr;
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {applicants.map((applicant) => (
          <div
            key={applicant.id}
            className="flex flex-col justify-between rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 shadow-2xs transition-all hover:border-[var(--color-border-hover)] hover:shadow-xs"
          >
            <div>
              {/* Applicant Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0071e3]/15 to-[#5a6ef5]/25 text-[#0071e3] font-semibold text-[13px]">
                    {applicant.avatarInitials}
                  </div>
                  <div>
                    <h3 className="text-[14px] sm:text-[15px] font-semibold text-[var(--color-text-primary)]">
                      {applicant.name}
                    </h3>
                    <p className="text-[12px] text-[var(--color-text-secondary)]">
                      {applicant.role}
                    </p>
                  </div>
                </div>

                {/* Match Placeholder badge */}
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-100">
                  {applicant.matchScore} match
                </span>
              </div>

              {/* Project applied for */}
              <div className="mt-3.5 rounded-xl bg-[var(--color-canvas-surface)] px-3 py-2">
                <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Applied for
                </span>
                <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">
                  {applicant.projectAppliedFor}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {applicant.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="mt-4 pt-3.5 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
              <span className="text-[12px] text-[var(--color-text-tertiary)]">
                Demo applicant
              </span>
              <button
                type="button"
                className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-3.5 text-[12px] font-medium text-[var(--color-text-primary)] shadow-2xs hover:bg-[var(--color-canvas-surface)] hover:border-[var(--color-border-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all"
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
