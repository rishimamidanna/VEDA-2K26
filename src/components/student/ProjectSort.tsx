"use client";

import { ChevronDown } from "lucide-react";
import type { SortOption } from "@/types";

const SORT_OPTIONS: SortOption[] = [
  "Recommended",
  "Newest",
  "Budget: High to Low",
  "Budget: Low to High",
  "Deadline",
];

interface ProjectSortProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
}

export function ProjectSort({ value, onChange }: ProjectSortProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="appearance-none rounded-xl border border-[var(--color-border-subtle)] bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-[var(--color-text-primary)] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
        aria-label="Sort projects"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
      />
    </div>
  );
}
