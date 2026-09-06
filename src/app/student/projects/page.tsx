"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X } from "lucide-react";
import { StudentLayout } from "@/components/student/StudentLayout";
import {
  ProjectSearch,
  ProjectSort,
  ProjectFilters,
  FullProjectCard,
  ProjectEmptyState,
} from "@/components/student";
import { useSharedProjects } from "@/lib/shared-repository";
import type { ProjectFilters as FiltersType, SortOption } from "@/types";

const INITIAL_FILTERS: FiltersType = {
  category: null,
  skills: [],
  budgetRange: null,
  duration: null,
  experienceLevel: null,
};

export default function FindProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("Recommended");
  const [filters, setFilters] = useState<FiltersType>(INITIAL_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery("");
  };

  // Filter and sort logic
  const allProjects = useSharedProjects();
  const filteredProjects = useMemo(() => {
    let result = [...allProjects];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.skills.some((s) => s.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // 2. Filters
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }
    if (filters.experienceLevel) {
      result = result.filter((p) => p.experienceLevel === filters.experienceLevel);
    }
    if (filters.skills.length > 0) {
      result = result.filter((p) =>
        filters.skills.every((skill) => p.skills.includes(skill))
      );
    }
    if (filters.budgetRange) {
      result = result.filter((p) => {
        if (filters.budgetRange === "Under ₹5,000") return p.budgetValue! < 5000;
        if (filters.budgetRange === "₹5,000–₹10,000") return p.budgetValue! >= 5000 && p.budgetValue! <= 10000;
        if (filters.budgetRange === "₹10,000–₹25,000") return p.budgetValue! > 10000 && p.budgetValue! <= 25000;
        if (filters.budgetRange === "₹25,000+") return p.budgetValue! > 25000;
        return true;
      });
    }
    if (filters.duration) {
      result = result.filter((p) => {
        if (filters.duration === "Less than 1 week") return p.durationWeeks! < 1;
        if (filters.duration === "1–2 weeks") return p.durationWeeks! >= 1 && p.durationWeeks! <= 2;
        if (filters.duration === "2–4 weeks") return p.durationWeeks! > 2 && p.durationWeeks! <= 4;
        if (filters.duration === "1+ month") return p.durationWeeks! > 4;
        return true;
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "Newest":
          // Mock sorting by parsing "X hours ago", but for now just reverse id as a mock
          return parseInt(b.id) - parseInt(a.id);
        case "Budget: High to Low":
          return b.budgetValue! - a.budgetValue!;
        case "Budget: Low to High":
          return a.budgetValue! - b.budgetValue!;
        case "Deadline":
          // Mock sorting by deadline string comparison
          return (a.deadline || "").localeCompare(b.deadline || "");
        case "Recommended":
        default:
          return b.matchPercentage! - a.matchPercentage!;
      }
    });

    return result;
  }, [searchQuery, filters, sortOption]);

  const topMatches = useMemo(() => {
    // Top matches are just the highest match percentage projects (if not filtering)
    if (searchQuery || Object.values(filters).some((v) => v && (Array.isArray(v) ? v.length > 0 : true))) {
      return [];
    }
    return [...allProjects].sort((a, b) => b.matchPercentage! - a.matchPercentage!).slice(0, 3);
  }, [searchQuery, filters]);

  return (
    <StudentLayout title="Find Projects">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex h-full flex-col"
      >
        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Find Projects
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Discover projects that match your skills and help you build real-world experience.
            </p>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {filteredProjects.length} projects available
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <ProjectSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] lg:hidden"
            >
              <Filter size={16} />
              Filters
            </button>
            <ProjectSort value={sortOption} onChange={setSortOption} />
          </div>
        </div>

        <div className="flex flex-1 gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-6">
              <ProjectFilters
                filters={filters}
                onChange={setFilters}
                onClear={handleClearFilters}
              />
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/40 lg:hidden"
                  onClick={() => setMobileFiltersOpen(false)}
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl lg:hidden"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Filters</h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="rounded-full p-2 hover:bg-[var(--color-canvas-surface)]"
                    >
                      <X size={20} className="text-[var(--color-text-secondary)]" />
                    </button>
                  </div>
                  <ProjectFilters
                    filters={filters}
                    onChange={setFilters}
                    onClear={handleClearFilters}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 pb-12">
            {topMatches.length > 0 && sortOption === "Recommended" && (
              <div className="mb-10">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Best matches for you
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {topMatches.map((project, i) => (
                    <FullProjectCard key={`top-${project.id}`} project={project} index={i} />
                  ))}
                </div>
                <div className="my-8 h-px w-full bg-[var(--color-border-subtle)]" />
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  All Projects
                </h2>
              </div>
            )}

            {filteredProjects.length === 0 ? (
              <ProjectEmptyState onClear={handleClearFilters} />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map((project, i) => (
                  <FullProjectCard key={project.id} project={project} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </StudentLayout>
  );
}
