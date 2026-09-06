"use client";

import { cn } from "@/lib/utils";

interface ProjectMatchBadgeProps {
  percentage: number;
  className?: string;
}

export function ProjectMatchBadge({ percentage, className }: ProjectMatchBadgeProps) {
  const color =
    percentage >= 90 ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
    percentage >= 80 ? "bg-blue-50 text-blue-700 border-blue-100" :
    "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        color,
        className
      )}
    >
      {percentage}% Match
    </span>
  );
}
