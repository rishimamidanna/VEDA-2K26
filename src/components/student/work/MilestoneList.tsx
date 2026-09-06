"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { Milestone } from "@/types";

interface MilestoneListProps {
  milestones: Milestone[];
}

export function MilestoneList({ milestones }: MilestoneListProps) {
  if (milestones.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
        Milestones
      </h3>
      <div className="flex flex-col gap-3">
        {milestones.map((milestone, index) => {
          const isCompleted = milestone.status === "Completed";
          const isInProgress = milestone.status === "In Progress";

          return (
            <div key={milestone.id} className="flex items-start gap-3 rounded-xl border border-[var(--color-border-subtle)] p-4 bg-white">
              <span className="flex-shrink-0 text-sm font-bold text-[var(--color-text-tertiary)]">
                {index + 1}.
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {milestone.title}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : isInProgress ? (
                  <Clock size={16} className="text-blue-500" />
                ) : (
                  <Circle size={16} className="text-gray-300" />
                )}
                <span className={`text-xs font-semibold ${
                  isCompleted ? "text-emerald-700" :
                  isInProgress ? "text-blue-700" :
                  "text-gray-400"
                }`}>
                  {milestone.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
