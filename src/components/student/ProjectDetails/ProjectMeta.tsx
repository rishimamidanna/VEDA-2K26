"use client";

import { Clock, IndianRupee, Briefcase, Calendar, User2 } from "lucide-react";
import type { Project } from "@/types";

export function ProjectMeta({ project }: { project: Project }) {
  const metaItems = [
    { icon: IndianRupee, label: "Budget", value: project.budget },
    { icon: Clock, label: "Duration", value: project.duration },
    { icon: Briefcase, label: "Experience", value: project.experienceLevel },
    { icon: User2, label: "Posted", value: project.postedAt },
    { icon: Calendar, label: "Deadline", value: project.deadline || "TBD" },
  ];

  return (
    <div className="mb-10 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] p-6">
      <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 md:flex md:flex-wrap md:items-center md:justify-between">
        {metaItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                <Icon size={14} />
                {item.label}
              </span>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
