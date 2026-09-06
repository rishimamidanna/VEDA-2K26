"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ClientProjectDetail, ProjectStatus } from "@/data/client-projects";

export interface ProjectDetailViewProps {
  project: ClientProjectDetail;
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const [showEditPlaceholder, setShowEditPlaceholder] = useState(false);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "Open":
        return {
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          indicator: "bg-emerald-500",
          text: "Open for Applications",
        };
      case "In Progress":
        return {
          badge: "bg-blue-50 text-blue-700 border-blue-200/60",
          indicator: "bg-blue-500",
          text: "In Progress with Student",
        };
      case "Completed":
        return {
          badge: "bg-purple-50 text-purple-700 border-purple-200/60",
          indicator: "bg-purple-500",
          text: "Completed & Delivered",
        };
      case "Draft":
        return {
          badge: "bg-amber-50 text-amber-700 border-amber-200/60",
          indicator: "bg-amber-500",
          text: "Draft — Not Published",
        };
      default:
        return {
          badge: "bg-gray-50 text-gray-700 border-gray-200/60",
          indicator: "bg-gray-500",
          text: status,
        };
    }
  };

  const statusConfig = getStatusBadge(project.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
        <Link
          href="/client/dashboard"
          className="hover:text-[var(--color-text-primary)] transition-colors"
        >
          Dashboard
        </Link>
        <span className="text-[var(--color-text-tertiary)]">/</span>
        <Link
          href="/client/projects"
          className="hover:text-[var(--color-text-primary)] transition-colors"
        >
          My Projects
        </Link>
        <span className="text-[var(--color-text-tertiary)]">/</span>
        <span className="font-medium text-[var(--color-text-primary)] truncate max-w-[200px] sm:max-w-xs">
          {project.title}
        </span>
      </nav>

      {/* Main Project Header Card */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-6 sm:p-8 lg:p-10 shadow-2xs space-y-6">
        {/* Top Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold",
                statusConfig.badge
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.indicator)} />
              <span>{statusConfig.text}</span>
            </span>

            <span className="inline-flex items-center rounded-full bg-[var(--color-canvas-surface)] border border-[var(--color-border-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
              {project.category}
            </span>

            {project.isUserCreated ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                Your Project &bull; {project.id}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#0071e3]">
                Demo Project &bull; {project.id}
              </span>
            )}
          </div>

          <div className="text-[12px] text-[var(--color-text-tertiary)]">
            Posted on {project.postedDate}
          </div>
        </div>

        {/* Project Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            {project.title}
          </h1>
          <p className="mt-4 text-[14px] sm:text-[15px] lg:text-[16px] leading-relaxed text-[var(--color-text-secondary)]">
            {project.description}
          </p>
        </div>

        {/* Action Buttons: View Applicants + Edit Project */}
        <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href={`/client/projects/${project.id}/applicants`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-text-primary)] px-6 text-[14px] font-medium text-white shadow-xs transition-all hover:bg-black hover:shadow-sm active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <span>View Applicants</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[12px] font-semibold">
              {project.applicantsCount}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setShowEditPlaceholder(true)}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-6 text-[14px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] hover:border-[var(--color-border-hover)] active:scale-[0.98] transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            Edit Project
          </button>
        </div>

        {/* Notification feedback toasts / alerts */}
        {showEditPlaceholder && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-900 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Edit Project Note:</span>
              <span>Project editing workflow will be enabled in a future milestone.</span>
            </div>
            <button
              type="button"
              onClick={() => setShowEditPlaceholder(false)}
              className="text-amber-700 hover:text-amber-900 font-semibold text-[14px]"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Two-Column Details Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope, Skills, Deliverables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Required Skills */}
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-6 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
              Required Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-text-primary)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Key Deliverables */}
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-6 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
              Key Deliverables
            </h2>
            <ul className="space-y-2.5">
              {project.deliverables.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[13px] sm:text-[14px] text-[var(--color-text-secondary)]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[11px] font-semibold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Project Meta Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-6 shadow-2xs space-y-5">
            <h2 className="text-base font-semibold tracking-tight text-[var(--color-text-primary)] pb-3 border-b border-[var(--color-border-subtle)]">
              Project Snapshot
            </h2>

            {/* Budget */}
            <div>
              <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
                Project Budget
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {project.budget}
                </span>
                <span className="text-[12px] text-[var(--color-text-tertiary)]">
                  INR
                </span>
              </div>
            </div>

            {/* Estimated Duration */}
            <div>
              <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
                Estimated Duration
              </span>
              <p className="mt-1 text-[14px] font-medium text-[var(--color-text-primary)]">
                {project.duration}
              </p>
            </div>

            {/* Experience Level */}
            <div>
              <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
                Target Experience
              </span>
              <p className="mt-1 text-[14px] font-medium text-[var(--color-text-primary)]">
                {project.experienceLevel}
              </p>
            </div>

            {/* Total Applicants */}
            <div>
              <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
                Applicant Submissions
              </span>
              <p className="mt-1 text-[14px] font-medium text-[var(--color-text-primary)]">
                {project.applicantsCount} {project.applicantsCount === 1 ? "applicant" : "applicants"}
              </p>
            </div>

            {/* Timeline note */}
            {project.timelineNote && (
              <div className="pt-3 border-t border-[var(--color-border-subtle)]">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  Status Note
                </span>
                <p className="mt-1 text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
                  {project.timelineNote}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
