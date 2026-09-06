import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  DashboardEmptyState,
  RecentApplicants,
  FindTalentCard,
  ApplicantPreviewItem,
  ClientWelcomeGreeting,
} from "@/components/client";

export const metadata: Metadata = {
  title: "Dashboard | Client Portal | SkillBridge",
  description: "Manage your projects and connect with talented students on SkillBridge.",
};

const DEMO_APPLICANTS: ApplicantPreviewItem[] = [
  {
    id: "app-1",
    name: "Aarav Sharma",
    avatarInitials: "AS",
    role: "Computer Science @ IIT Bombay",
    skills: ["Next.js", "TypeScript", "Tailwind CSS"],
    projectAppliedFor: "Mobile App Landing Page & Design",
    matchScore: "95%",
  },
  {
    id: "app-2",
    name: "Diya Patel",
    avatarInitials: "DP",
    role: "Design & Media @ NID",
    skills: ["Figma", "UI/UX", "Brand Identity"],
    projectAppliedFor: "SaaS Product Design & Wireframes",
    matchScore: "92%",
  },
];

export default function ClientDashboardPage() {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header Section */}
      <ClientWelcomeGreeting />

      {/* 1. Overview Section */}
      <section aria-labelledby="overview-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            id="overview-heading"
            className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text-primary)]"
          >
            Overview
          </h2>
        </div>

        {/* Overview Metric Cards (Clean, honest empty states without fake numbers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 shadow-2xs transition-all hover:shadow-xs">
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Active Projects
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-[var(--color-text-primary)]">
                0
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
              No live projects yet
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 shadow-2xs transition-all hover:shadow-xs">
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Total Applicants
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-[var(--color-text-primary)]">
                2
              </span>
              <span className="text-[11px] font-medium text-[#0071e3]">
                demo
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
              Preview applicants below
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 shadow-2xs transition-all hover:shadow-xs">
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Hired Talent
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-[var(--color-text-primary)]">
                0
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
              Ready to collaborate
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 shadow-2xs transition-all hover:shadow-xs">
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Completed Projects
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-[var(--color-text-primary)]">
                0
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
              Milestones delivered
            </p>
          </div>
        </div>
      </section>

      {/* 2. Find Talent Card (Submilestone 3.2) */}
      <FindTalentCard />

      {/* 3. Recent Projects Section */}
      <section aria-labelledby="recent-projects-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2
              id="recent-projects-heading"
              className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text-primary)]"
            >
              Recent Projects
            </h2>
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              Track project status, milestones, and hiring progress.
            </p>
          </div>

          <Link
            href="/client/projects/new"
            className="text-[13px] font-medium text-[#0071e3] hover:underline focus-visible:outline-hidden"
          >
            Create project &rarr;
          </Link>
        </div>

        <DashboardEmptyState
          title="No active projects"
          description="You haven't posted any projects yet. Create your first project posting to start receiving proposals from qualified students."
          actionText="Post Your First Project"
          actionHref="/client/projects/new"
          icon={
            <svg
              className="h-6 w-6"
              aria-hidden={true}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              <rect width="20" height="14" x="2" y="6" rx="2" />
            </svg>
          }
        />
      </section>

      {/* 4. Recent Applicants Section (Submilestone 3.2: Clearly demo-labelled preview) */}
      <RecentApplicants applicants={DEMO_APPLICANTS} />
    </div>
  );
}
