"use client";

import { cn } from "@/lib/utils";

export type ApplicationTab = "All" | "Pending" | "Shortlisted" | "Accepted" | "Rejected";

interface ApplicationTabsProps {
  activeTab: ApplicationTab;
  onChange: (tab: ApplicationTab) => void;
  counts: Record<ApplicationTab, number>;
}

export function ApplicationTabs({ activeTab, onChange, counts }: ApplicationTabsProps) {
  const tabs: ApplicationTab[] = ["All", "Pending", "Shortlisted", "Accepted", "Rejected"];

  return (
    <div className="mb-6 -mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
      <div className="flex w-max items-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] p-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/50"
              )}
            >
              {tab}
              <span
                className={cn(
                  "flex items-center justify-center rounded-full px-2 py-0.5 text-xs",
                  isActive
                    ? "bg-[var(--color-canvas-surface)] text-[var(--color-text-primary)]"
                    : "bg-white border border-[var(--color-border-subtle)]"
                )}
              >
                {counts[tab]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
