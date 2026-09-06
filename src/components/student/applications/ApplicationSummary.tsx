"use client";

import { motion } from "framer-motion";

interface ApplicationSummaryProps {
  counts: {
    total: number;
    pending: number;
    shortlisted: number;
    accepted: number;
    rejected: number;
  };
}

export function ApplicationSummary({ counts }: ApplicationSummaryProps) {
  const stats = [
    { label: "Total Applications", value: counts.total, color: "text-[var(--color-text-primary)]" },
    { label: "Pending", value: counts.pending, color: "text-gray-600" },
    { label: "Shortlisted", value: counts.shortlisted, color: "text-blue-600" },
    { label: "Accepted", value: counts.accepted, color: "text-emerald-600" },
    { label: "Rejected", value: counts.rejected, color: "text-red-600" },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
          className="flex flex-col gap-1 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-5"
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
