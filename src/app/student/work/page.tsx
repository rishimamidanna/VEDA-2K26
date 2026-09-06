"use client";

import { useState, useMemo } from "react";
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
import { getAllWorkProjects } from "@/data/work";
import type { WorkTab } from "@/components/student/work";
import type { SortOption } from "@/types";

export default function MyWorkPage() {
  const [activeTab, setActiveTab] = useState<WorkTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("Newest");

  const allWork = useMemo(() => getAllWorkProjects(), []);

  // Compute counts
  const counts = useMemo(() => {
    return {
      All: allWork.length,
      Active: allWork.filter((w) => w.status === "In Progress").length,
      "Awaiting Review": allWork.filter((w) => w.status === "Awaiting Review").length,
      Completed: allWork.filter((w) => w.status === "Completed").length,
      dueThisWeek: allWork.filter((w) => w.status === "In Progress" && w.project.durationWeeks <= 1).length, // simple mock calculation
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
          w.project.client.toLowerCase().includes(q) ||
          w.project.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "Budget: High to Low":
          return b.project.budgetValue - a.project.budgetValue;
        case "Budget: Low to High":
          return a.project.budgetValue - b.project.budgetValue;
        case "Deadline": // use progress as a mock for recently updated/deadline since we don't have true dates
          return b.progress - a.progress; 
        case "Newest":
        default:
          return parseInt(b.id.split("_")[1] || "0") - parseInt(a.id.split("_")[1] || "0");
      }
    });

    return result;
  }, [allWork, activeTab, searchQuery, sortOption]);

  return (
    <StudentLayout title="My Work">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-5xl"
      >
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              My Work
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Manage your active projects and keep track of your progress.
            </p>
          </div>
          <Link
            href="/student/projects"
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Find More Projects
            <ArrowRight size={16} />
          </Link>
        </div>

        <WorkSummary
          counts={{
            active: counts.Active,
            dueThisWeek: counts.dueThisWeek,
            awaitingReview: counts["Awaiting Review"],
            completed: counts.Completed,
          }}
        />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <WorkTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-64">
              <ProjectSearch value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="w-full sm:w-48">
              <ProjectSort value={sortOption} onChange={setSortOption} />
            </div>
          </div>
        </div>

        {filteredWork.length === 0 ? (
          <WorkEmptyState tab={activeTab} />
        ) : (
          <div className="flex flex-col gap-6 pb-12">
            {filteredWork.map((work, i) => (
              work.status === "Completed" ? (
                <CompletedProjectCard key={work.id} work={work} project={work.project} index={i} />
              ) : (
                <WorkProjectCard key={work.id} work={work} project={work.project} index={i} />
              )
            ))}
          </div>
        )}
      </motion.div>
    </StudentLayout>
  );
}
