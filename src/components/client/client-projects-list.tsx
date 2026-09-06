// @ts-nocheck
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useClientAuth } from "./client-auth-context";
import {
  clientProjectsRepository,
  type ClientProjectItem,
} from "@/lib/client-projects-repository";
import { type ProjectStatus } from "@/types";

const FILTERS: { label: string; value: "All" | ProjectStatus }[] = [
  { label: "All", value: "All" },
  { label: "Draft", value: "Draft" },
  { label: "Open", value: "Open" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
];

export function ClientProjectsList() {
  const { user } = useClientAuth();
  const [activeFilter, setActiveFilter] = useState<"All" | ProjectStatus>("All");
  const [projects, setProjects] = useState<ClientProjectItem[]>(() =>
    clientProjectsRepository.getAllProjects(user?.id)
  );

  useEffect(() => {
    const handleProjectsUpdated = () => {
      setProjects(clientProjectsRepository.getAllProjects(user?.id));
    };

    window.addEventListener("skillbridge_projects_updated", handleProjectsUpdated);
    window.addEventListener("storage", handleProjectsUpdated);

    return () => {
      window.removeEventListener("skillbridge_projects_updated", handleProjectsUpdated);
      window.removeEventListener("storage", handleProjectsUpdated);
    };
  }, [user?.id]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return projects;
    return projects.filter((p) => p.status === activeFilter);
  }, [projects, activeFilter]);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "Open":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "Completed":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      case "Draft":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200/60";
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              My Projects
            </h1>
            {projects.some((p) => p.isUserCreated) ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                Live &bull; {projects.filter((p) => p.isUserCreated).length} custom
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#0071e3]">
                Demo data
              </span>
            )}
          </div>
          <p className="mt-1 text-[14px] sm:text-[15px] text-[var(--color-text-secondary)]">
            Manage your posted projects, track candidate applications, and monitor progress.
          </p>
        </div>

        <Link
          href="/client/projects/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--color-text-primary)] px-5 text-[13px] sm:text-[14px] font-medium text-white shadow-xs transition-all hover:bg-black hover:shadow-sm active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] shrink-0 self-start sm:self-auto"
        >
          <span className="text-[16px] leading-none font-light">+</span>
          <span>Post a Project</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {FILTERS.map((tab) => {
          const isSelected = activeFilter === tab.value;
          const count =
            tab.value === "All"
              ? projects.length
              : projects.filter((p) => p.status === tab.value).length;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] shrink-0",
                isSelected
                  ? "bg-[var(--color-text-primary)] text-white shadow-xs font-semibold"
                  : "bg-[var(--color-canvas-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-canvas-surface)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[11px] font-semibold",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-[var(--color-canvas-surface)] text-[var(--color-text-tertiary)]"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-8 sm:p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-canvas-surface)] text-[var(--color-text-tertiary)]">
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
          </div>
          <h3 className="text-[15px] sm:text-[16px] font-semibold text-[var(--color-text-primary)]">
            No {activeFilter} projects found
          </h3>
          <p className="mt-1.5 max-w-sm text-[13px] sm:text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
            There are no projects currently marked as &ldquo;{activeFilter}&rdquo;. Create a new project or select another filter tab.
          </p>
          <Link
            href="/client/projects/new"
            className="mt-5 inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-4 text-[13px] font-medium text-[var(--color-text-primary)] shadow-2xs hover:bg-[var(--color-canvas-surface)] hover:border-[var(--color-border-hover)]"
          >
            Post a Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col justify-between rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 sm:p-6 shadow-2xs transition-all hover:border-[var(--color-border-hover)] hover:shadow-xs"
            >
              <div className="space-y-3">
                {/* Top Bar: Title, Status, and Posted Date */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        getStatusBadge(project.status)
                      )}
                    >
                      {project.status}
                    </span>
                    {project.isUserCreated ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Your Project
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-[#0071e3]/10 px-2 py-0.5 text-[10px] font-medium text-[#0071e3]">
                        Demo project
                      </span>
                    )}
                    <span className="text-[12px] text-[var(--color-text-tertiary)]">
                      Posted on {project.postedAt ? new Date(project.postedAt).toLocaleDateString() : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-text-primary)]">
                    <span className="text-[12px] font-normal text-[var(--color-text-secondary)]">Budget:</span>
                    <span>{project.budget}</span>
                  </div>
                </div>

                {/* Project Title and Description */}
                <div>
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text-primary)] group-hover:text-[#0071e3] transition-colors">
                    {project.title}
                  </h2>
                  <p className="mt-1.5 text-[13px] sm:text-[14px] leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">
                    {project.description}
                  </p>
                </div>

                {/* Required Skills Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Footer: Applicants count & View Project action */}
              <div className="mt-5 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-canvas-surface)] text-[var(--color-text-secondary)]">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                    {project.applicantsCount}{" "}
                    <span className="text-[12px] font-normal text-[var(--color-text-secondary)]">
                      {project.applicantsCount === 1 ? "Applicant" : "Applicants"}
                    </span>
                  </span>
                </div>

                <Link
                  href={`/client/projects/${project.id}`}
                  className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-4 text-[12px] font-medium text-[var(--color-text-primary)] shadow-2xs hover:bg-[var(--color-canvas-surface)] hover:border-[var(--color-border-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all"
                >
                  View Project
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
