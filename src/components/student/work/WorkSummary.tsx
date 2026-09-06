"use client";

import { motion } from "framer-motion";

interface WorkSummaryProps {
  counts: {
    active: number;
    dueThisWeek: number;
    awaitingReview: number;
    completed: number;
  };
}

export function WorkSummary({ counts }: WorkSummaryProps) {
  const stats = [
    { label: "Active", value: counts.active, color: "text-blue-600" },
    { label: "Due This Week", value: counts.dueThisWeek, color: "text-orange-600" },
    { label: "Awaiting Review", value: counts.awaitingReview, color: "text-purple-600" },
    { label: "Completed", value: counts.completed, color: "text-emerald-600" },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
          className="flex flex-col gap-1 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
