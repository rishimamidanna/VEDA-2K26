"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { StudentLayout, ProjectSearch, ProjectSort } from "@/components/student";
import {
  WorkSummary,
  WorkTabs,
  WorkProjectCard,
  CompletedProjectCard,
  WorkEmptyState,
} from "@/components/student/work";
import { useSharedWorkProjects, useSharedApplications, useSharedProjects } from "@/lib/shared-repository";
import type { WorkTab } from "@/components/student/work";
import type { SortOption } from "@/types";
import type { WorkProject } from "@/types";

export default function MyWorkPage() {
  const [activeTab, setActiveTab] = useState<WorkTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("Newest");

  const sharedWork = useSharedWorkProjects();
  const sharedApps = useSharedApplications();
  const sharedProjects = useSharedProjects();

  const allWork = useMemo(() => {
    // 1. Get existing work projects and attach their full Project details
    const existingWork = sharedWork.map(w => ({
      ...w,
      project: sharedProjects.find(p => p.id === w.projectId)!
    })).filter(w => w.project !== undefined);

    // 2. Identify Accepted applications that don't have a corresponding WorkProject yet
    const acceptedApps = sharedApps.filter(a => a.status === "Accepted" && a.studentId === "student-1");
    const newWorkFromApps = acceptedApps
      .filter(app => !existingWork.some(w => w.projectId === app.projectId))
      .map(app => {
        const project = sharedProjects.find(p => p.id === app.projectId)!;
        const newWork: WorkProject & { project: any } = {
          id: `work-derived-${app.id}`,
          projectId: app.projectId,
          studentId: app.studentId,
          clientId: project.clientId,
          status: "In Progress",
          progress: 0,
          lastActivity: "Project started",
          milestones: [],
          deliverables: [],
          recentActivity: [
            { id: "act-1", type: "note", content: "Application accepted. Contract started.", timestamp: new Date().toISOString() }
          ],
          project: project
        };
        return newWork;
      }).filter(w => w.project !== undefined);

    return [...existingWork, ...newWorkFromApps];
  }, [sharedWork, sharedApps, sharedProjects]);

  // Compute counts
  const counts = useMemo(() => {
    return {
      All: allWork.length,
      Active: allWork.filter((w) => w.status === "In Progress").length,
      "Awaiting Review": allWork.filter((w) => w.status === "Awaiting Review").length,
      Completed: allWork.filter((w) => w.status === "Completed").length,
      dueThisWeek: allWork.filter((w) => w.status === "In Progress" && w.project.durationWeeks! <= 1).length,
    };
  }, [allWork]);

  // Filter and sort
  const filteredWork = useMemo(() => {
    let result = [...allWork];

    // Tab filter
    if (activeTab === "Active") {
      result = result.filter((w) => w.status === "In Progress");
    } else if (activeTab === "Awaiting Review") {
      result = result.filter((w) => w.status === "Awaiting Review");
    } else if (activeTab === "Completed") {
      result = result.filter((w) => w.status === "Completed");
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.project.title.toLowerCase().includes(q) ||
          (w.project.client || "Client").toLowerCase().includes(q) ||
          w.project.skills.some((s: string) => s.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if ((sortOption as string) === "Highest Budget") {
        return (b.project.budgetValue || 0) - (a.project.budgetValue || 0);
      }
      if ((sortOption as string) === "Lowest Budget") {
        return (a.project.budgetValue || 0) - (b.project.budgetValue || 0);
      }
      return 0; // "Newest" or fallback
    });

    return result;
  }, [allWork, activeTab, searchQuery, sortOption]);

  const summaryCounts = useMemo(() => ({
    active: counts.Active,
    awaitingReview: counts["Awaiting Review"],
    completed: counts.Completed,
    dueThisWeek: counts.dueThisWeek
  }), [counts]);

  return (
    <StudentLayout title="My Work">
      <div className="mx-auto max-w-6xl xl:px-4">
        {allWork.length === 0 ? (
          <WorkEmptyState tab={activeTab} />
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start xl:gap-10">
            {/* Left Column (Summary & List) */}
            <div className="flex-1 min-w-0">
              <WorkSummary counts={summaryCounts} />
              
              <div className="mt-8 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-6">
                  <h2 className="mb-4 text-xl font-bold text-[var(--color-text-primary)]">
                    Active Contracts
                  </h2>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <WorkTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <ProjectSearch value={searchQuery} onChange={setSearchQuery} />
                      <ProjectSort value={sortOption} onChange={setSortOption} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {filteredWork.length === 0 ? (
                    <div className="py-12 text-center text-[var(--color-text-secondary)]">
                      No projects match your current filters.
                    </div>
                  ) : (
                    filteredWork.map((work) => (
                      work.status === "Completed" ? (
                        <CompletedProjectCard key={work.id} work={work as any} project={work.project} />
                      ) : (
                        <WorkProjectCard key={work.id} work={work as any} project={work.project} />
                      )
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="hidden lg:block lg:w-[320px] flex-shrink-0 pt-2 space-y-6">
              {/* Earnings Overview Card */}
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">Earnings Overview</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">Total Earned</p>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">₹42,500</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">Pending Clearance</p>
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">₹12,000</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle)]">
                  <Link
                    href="#"
                    className="flex items-center text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    View Financials
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>

              {/* Weekly Deadlines Card */}
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">This Week</h3>
                {counts.dueThisWeek > 0 ? (
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    You have <span className="font-bold text-[var(--color-text-primary)]">{counts.dueThisWeek}</span> milestone{counts.dueThisWeek > 1 ? "s" : ""} due this week. Keep up the good work!
                  </p>
                ) : (
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    No immediate deadlines this week. Great time to get ahead!
                  </p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </StudentLayout>
  );
}
