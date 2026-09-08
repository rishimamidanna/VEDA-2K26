"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { StudentLayout, ProjectSearch, ProjectSort } from "@/components/student";
import {
  ApplicationSummary,
  ApplicationTabs,
  ApplicationCard,
  ApplicationEmptyState,
} from "@/components/student/applications";
import { apiClient } from "@/lib/api-client";
import { mapApplication, mapProject } from "@/lib/api-mappers";
import type { ApplicationTab } from "@/components/student/applications";
import type { SortOption, Application, Project } from "@/types";

type ApplicationWithProject = Application & { project: Project };

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<ApplicationTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("Newest");
  const [allApps, setAllApps] = useState<ApplicationWithProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadApplications() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiClient.get<any[]>("/api/applications");
        if (isMounted && Array.isArray(data)) {
          const mapped = data.map((raw: any) => {
            const app = mapApplication(raw);
            const project = mapProject(raw.project);
            return { ...app, project };
          });
          setAllApps(mapped);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load applications.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadApplications();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute counts for summary and tabs
  const counts = useMemo(() => {
    return {
      All: allApps.length,
      Pending: allApps.filter((a) => a.status === "Pending").length,
      Shortlisted: allApps.filter((a) => a.status === "Shortlisted").length,
      Accepted: allApps.filter((a) => a.status === "Accepted").length,
      Rejected: allApps.filter((a) => a.status === "Rejected").length,
    };
  }, [allApps]);

  // Filter and sort
  const filteredApps = useMemo(() => {
    let result = [...allApps];

    // Status filter
    if (activeTab !== "All") {
      result = result.filter((a) => a.status === activeTab);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.project?.title?.toLowerCase().includes(q) ||
          (a.project?.client || "").toLowerCase().includes(q) ||
          a.project?.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "Recommended":
          return (b.project?.matchPercentage || 0) - (a.project?.matchPercentage || 0);
        case "Budget: High to Low":
          return (b.project?.budgetValue || 0) - (a.project?.budgetValue || 0);
        case "Budget: Low to High":
          return (a.project?.budgetValue || 0) - (b.project?.budgetValue || 0);
        case "Newest":
        default:
          return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      }
    });

    return result;
  }, [allApps, activeTab, searchQuery, sortOption]);

  return (
    <StudentLayout title="My Applications">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-5xl"
      >
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              My Applications
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Track your proposals and monitor real-time review progress.
            </p>
          </div>
          <Link
            href="/student/projects"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Find Projects
          </Link>
        </div>

        <ApplicationSummary
          counts={{
            total: counts.All,
            pending: counts.Pending,
            shortlisted: counts.Shortlisted,
            accepted: counts.Accepted,
            rejected: counts.Rejected,
          }}
        />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ApplicationTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-64">
              <ProjectSearch value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="w-full sm:w-48">
              <ProjectSort value={sortOption} onChange={setSortOption} />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-text-primary)] border-t-transparent" />
            <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
              Loading your applications...
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
        ) : filteredApps.length === 0 ? (
          <ApplicationEmptyState tab={activeTab} />
        ) : (
          <div className="flex flex-col gap-4 pb-12">
            {filteredApps.map((app, i) => (
              <ApplicationCard key={app.id} application={app} project={app.project} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </StudentLayout>
  );
}
