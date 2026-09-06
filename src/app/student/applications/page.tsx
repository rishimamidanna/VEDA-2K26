"use client";

import { useState, useMemo } from "react";
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
import { useSharedApplications, useSharedProjects } from "@/lib/shared-repository";
import type { ApplicationTab } from "@/components/student/applications";
import type { SortOption } from "@/types";

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<ApplicationTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("Newest"); // We'll just use the same SortOption type but default to Newest

  const sharedApps = useSharedApplications();
  const sharedProjects = useSharedProjects();
  
  const allApps = useMemo(() => {
    return sharedApps
      .filter(a => a.studentId === "student-1")
      .map(app => ({
        ...app,
        project: sharedProjects.find(p => p.id === app.projectId)!
      }))
      .filter(a => a.project !== undefined);
  }, [sharedApps, sharedProjects]);

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
          a.project.title.toLowerCase().includes(q) ||
          a.project.client!.toLowerCase().includes(q) ||
          a.project.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "Recommended": // repurpose as Highest Match
          return b.project.matchPercentage! - a.project.matchPercentage!;
        case "Budget: High to Low":
          return b.project.budgetValue! - a.project.budgetValue!;
        case "Budget: Low to High":
          return a.project.budgetValue! - b.project.budgetValue!;
        case "Newest":
        default:
          // Mock sort: just string compare appliedAt for now or reverse id
          return parseInt(b.id.split("_")[1] || "0") - parseInt(a.id.split("_")[1] || "0");
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
              Track your applications and see where you stand.
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

        {filteredApps.length === 0 ? (
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
