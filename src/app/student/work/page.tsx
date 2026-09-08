"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StudentLayout, ProjectSearch, ProjectSort } from "@/components/student";
import {
  WorkSummary,
  WorkTabs,
  WorkProjectCard,
  CompletedProjectCard,
  WorkEmptyState,
} from "@/components/student/work";
import { apiClient } from "@/lib/api-client";
import { mapWorkContract } from "@/lib/api-mappers";
import type { WorkTab } from "@/components/student/work";
import type { SortOption, WorkProject, Project } from "@/types";

type WorkWithProject = WorkProject & { project: Project };

export default function MyWorkPage() {
  const [activeTab, setActiveTab] = useState<WorkTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [earnings, setEarnings] = useState<{
    availableBalance: string;
    pendingBalance: string;
    totalEarned: string;
    currency: string;
  } | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("Newest");
  const [allWork, setAllWork] = useState<WorkWithProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadWork() {
      try {
        setIsLoading(true);
        setError(null);
        const [data, earningsRes] = await Promise.all([
          apiClient.get<any[]>("/api/work"),
          apiClient.get<any>("/api/student/earnings").catch(() => null),
        ]);
        if (isMounted && Array.isArray(data)) {
          setAllWork(data.map((item) => mapWorkContract(item)));
        }
        if (isMounted && earningsRes?.wallet) {
          setEarnings(earningsRes.wallet);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load work contracts.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadWork();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute counts
  const counts = useMemo(() => {
    return {
      All: allWork.length,
      Active: allWork.filter((w) => w.status === "In Progress").length,
      "Awaiting Review": allWork.filter((w) => w.status === "Awaiting Review").length,
      Completed: allWork.filter((w) => w.status === "Completed").length,
      dueThisWeek: allWork.filter((w) => w.status === "In Progress" && (w.project?.durationWeeks || 2) <= 1).length,
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
          w.project?.title?.toLowerCase().includes(q) ||
          (w.project?.client || "Client").toLowerCase().includes(q) ||
          w.project?.skills?.some((s: string) => s.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if ((sortOption as string) === "Highest Budget") {
        return (b.project?.budgetValue || 0) - (a.project?.budgetValue || 0);
      }
      if ((sortOption as string) === "Lowest Budget") {
        return (a.project?.budgetValue || 0) - (b.project?.budgetValue || 0);
      }
      return 0;
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-text-primary)] border-t-transparent" />
            <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
              Loading your active contracts...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : allWork.length === 0 ? (
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Earnings &amp; Escrow</h3>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    Demo Escrow
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">Available Balance</p>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                      ₹{earnings ? parseFloat(earnings.availableBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-secondary)]">In Escrow (Pending)</p>
                      <p className="text-sm font-semibold text-amber-600">
                        ₹{earnings ? parseFloat(earnings.pendingBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-[var(--color-text-secondary)]">Total Cleared</p>
                      <p className="text-sm font-semibold text-emerald-600">
                        ₹{earnings ? parseFloat(earnings.totalEarned).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed pt-1">
                    Demo Payment — No real money is charged. Demo Escrow — No real funds are held.
                  </p>
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
