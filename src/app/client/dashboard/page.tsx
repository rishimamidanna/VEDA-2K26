"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  DashboardEmptyState,
  RecentApplicants,
  FindTalentCard,
  ClientWelcomeGreeting,
} from "@/components/client";
import { apiClient } from "@/lib/api-client";
import { Loader2, AlertCircle } from "lucide-react";

interface ClientDashboardStats {
  activeProjects: number;
  openProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  totalProjects: number;
  totalApplicants: number;
  hiredTalent: number;
  activeContracts: number;
  completedContracts: number;
}

interface ClientRecentProject {
  id: string;
  title: string;
  status: string;
  budget: string;
  applicantsCount: number;
  createdAt: string;
}

interface ClientDashboardData {
  stats: ClientDashboardStats;
  recentProjects: ClientRecentProject[];
  recentApplicants: any[];
}

export default function ClientDashboardPage() {
  const [data, setData] = useState<ClientDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get<ClientDashboardData>("/api/dashboard/client");
      if (res?.stats) {
        setData(res);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load client dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="space-y-8 sm:space-y-10">
        <ClientWelcomeGreeting />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 animate-pulse"
            >
              <div className="h-4 w-24 rounded bg-gray-100" />
              <div className="mt-3 h-8 w-16 rounded bg-gray-100" />
              <div className="mt-2 h-3 w-32 rounded bg-gray-100" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--color-text-tertiary)]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-8 sm:space-y-10">
        <ClientWelcomeGreeting />
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/60 p-6 text-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} className="text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-900">Failed to load dashboard data</p>
              <p className="text-xs text-red-700 mt-0.5">{error || "Could not retrieve live metrics."}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="rounded-xl bg-red-100 px-4 py-2 text-xs font-semibold text-red-900 hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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

        {/* Overview Metric Cards derived from PostgreSQL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 shadow-2xs transition-all hover:shadow-xs">
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Active Projects
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-[var(--color-text-primary)]">
                {data.stats.activeProjects}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
              {data.stats.activeProjects === 0
                ? "No live projects yet"
                : `${data.stats.openProjects} open, ${data.stats.inProgressProjects} in progress`}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 shadow-2xs transition-all hover:shadow-xs">
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Total Applicants
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-[var(--color-text-primary)]">
                {data.stats.totalApplicants}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
              {data.stats.totalApplicants === 0
                ? "No applications received yet"
                : "Across all posted projects"}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 shadow-2xs transition-all hover:shadow-xs">
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Hired Talent
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-[var(--color-text-primary)]">
                {data.stats.hiredTalent}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
              {data.stats.hiredTalent === 0
                ? "Ready to collaborate"
                : `${data.stats.activeContracts} active contracts`}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 shadow-2xs transition-all hover:shadow-xs">
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Completed Projects
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-[var(--color-text-primary)]">
                {data.stats.completedProjects}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
              {data.stats.completedProjects === 0
                ? "Milestones delivered"
                : "Successfully delivered"}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Find Talent Card */}
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

        {data.recentProjects.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col justify-between rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 shadow-2xs transition-all hover:border-[var(--color-border-hover)] hover:shadow-xs space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] line-clamp-1">
                      {project.title}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 shrink-0">
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-[var(--color-text-secondary)]">
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {project.budget}
                    </span>
                    <span>&bull;</span>
                    <span>
                      {project.applicantsCount}{" "}
                      {project.applicantsCount === 1 ? "applicant" : "applicants"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">
                    Created{" "}
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/client/projects/${project.id}`}
                    className="text-[12px] font-medium text-[#0071e3] hover:underline"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Recent Applicants Section */}
      {data.recentApplicants.length === 0 ? (
        <section aria-labelledby="recent-applicants-heading" className="space-y-4">
          <h2
            id="recent-applicants-heading"
            className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text-primary)]"
          >
            Recent Applicants
          </h2>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-8 text-center space-y-2">
            <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
              No applicants yet
            </p>
            <p className="text-[13px] text-[var(--color-text-secondary)] max-w-sm">
              As qualified students submit proposals for your posted projects, their profiles and
              match scores will appear here.
            </p>
          </div>
        </section>
      ) : (
        <RecentApplicants applicants={data.recentApplicants} />
      )}
    </div>
  );
}
