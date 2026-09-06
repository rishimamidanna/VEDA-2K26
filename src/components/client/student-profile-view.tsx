"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StudentProfile } from "@/data/student-talent";

export interface StudentProfileViewProps {
  student: StudentProfile;
}

export function StudentProfileView({ student }: StudentProfileViewProps) {
  const [invitedNotice, setInvitedNotice] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
        <Link
          href="/client/dashboard"
          className="hover:text-[var(--color-text-primary)] transition-colors"
        >
          Dashboard
        </Link>
        <span className="text-[var(--color-text-tertiary)]">/</span>
        <Link
          href="/client/talent"
          className="hover:text-[var(--color-text-primary)] transition-colors"
        >
          Find Talent
        </Link>
        <span className="text-[var(--color-text-tertiary)]">/</span>
        <span className="font-medium text-[var(--color-text-primary)] truncate">
          {student.name}
        </span>
      </nav>

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-6 sm:p-8 lg:p-10 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3]/15 via-[#5a6ef5]/20 to-[#9c71f7]/25 text-[#0071e3] font-bold text-[20px] shadow-xs">
              {student.avatarInitials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                  {student.name}
                </h1>
                <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/60 px-3 py-0.5 text-[11px] font-semibold text-emerald-800">
                  {student.availability}
                </span>
                <span className="inline-flex items-center rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#0071e3]">
                  Demo Student
                </span>
              </div>
              <p className="mt-1 text-[15px] font-medium text-[var(--color-text-secondary)]">
                {student.headline}
              </p>
              <p
                className="mt-0.5 text-[13px] text-[var(--color-text-tertiary)]"
                dangerouslySetInnerHTML={{ __html: student.college }}
              />
            </div>
          </div>

          {/* Quick Stats / Action */}
          <div className="flex flex-col sm:items-end gap-2.5">
            <button
              type="button"
              onClick={() => setInvitedNotice(true)}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-6 text-[13px] sm:text-[14px] font-medium text-white shadow-xs hover:bg-black active:scale-[0.98] transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              Invite to Project
            </button>
            <span className="text-[12px] text-[var(--color-text-tertiary)]">
              Member since {student.joinedDate}
            </span>
          </div>
        </div>

        {/* Invite feedback notice */}
        {invitedNotice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-[13px] text-emerald-900 flex items-center justify-between">
            <span>
              Invitation sent to {student.name} in demo mode!
            </span>
            <button
              type="button"
              onClick={() => setInvitedNotice(false)}
              className="text-emerald-700 font-semibold text-[14px]"
            >
              &times;
            </button>
          </div>
        )}

        {/* Bio */}
        <div className="pt-4 border-t border-[var(--color-border-subtle)] space-y-2">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
            About
          </h2>
          <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
            {student.bio}
          </p>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
            Skills &amp; Technologies
          </h2>
          <div className="flex flex-wrap gap-2">
            {student.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-text-primary)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Portfolio Projects Breakdown */}
        <div className="space-y-3 pt-2">
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
            Portfolio Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {student.portfolioProjects.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] p-4 space-y-2"
              >
                <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-[var(--color-canvas-bg)] border border-[var(--color-border-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
