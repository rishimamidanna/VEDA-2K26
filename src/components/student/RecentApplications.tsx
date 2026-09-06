"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { recentApplications } from "@/data/student";

type ApplicationStatus = "Shortlisted" | "Pending" | "Accepted";

const statusStyles: Record<ApplicationStatus, string> = {
  Accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Shortlisted: "bg-blue-50 text-blue-700 border-blue-100",
  Pending: "bg-gray-100 text-gray-600 border-gray-200",
};

export function RecentApplications() {
  return (
    <section className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="mb-4"
      >
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Recent Applications
        </h2>
        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
          Track your application status.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        className="rounded-2xl border border-[var(--color-border-subtle)] bg-white overflow-hidden"
      >
        <ul className="divide-y divide-[var(--color-border-subtle)]">
          {recentApplications.map((app, i) => (
            <motion.li
              key={app.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--color-canvas-surface)] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {app.title}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Applied {app.appliedAgo}
                </p>
              </div>
              <span
                className={cn(
                  "flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
                  statusStyles[app.status]
                )}
              >
                {app.status}
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
