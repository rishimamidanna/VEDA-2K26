"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { mapApplication, mapProject } from "@/lib/api-mappers";
import type { Application, Project } from "@/types";
import Link from "next/link";
import { Clock } from "lucide-react";

type ApplicationWithProject = Application & { project: Project };

const statusStyles: Record<string, string> = {
  Accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Shortlisted: "bg-blue-50 text-blue-700 border-blue-100",
  Pending: "bg-gray-100 text-gray-600 border-gray-200",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-100",
  Rejected: "bg-rose-50 text-rose-700 border-rose-100",
};

export function RecentApplications() {
  const [applications, setApplications] = useState<ApplicationWithProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiClient
      .get<any[]>("/api/applications")
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setApplications(
            data.map((raw: any) => ({
              ...mapApplication(raw),
              project: mapProject(raw.project),
            }))
          );
        }
      })
      .catch(() => {
        // Quietly handle if unauthenticated or error
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="mb-4 flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Recent Applications
          </h2>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            Track your application status.
          </p>
        </div>
        <Link
          href="/student/applications"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View all
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        className="rounded-2xl border border-[var(--color-border-subtle)] bg-white overflow-hidden"
      >
        {loading ? (
          <div className="p-6 text-center text-sm text-[var(--color-text-tertiary)]">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">No active applications</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Explore open projects to start applying.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border-subtle)]">
            {applications.slice(0, 5).map((app, i) => (
              <motion.li
                key={app.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--color-canvas-surface)] transition-colors"
              >
                <div className="min-w-0">
                  <Link
                    href={`/student/applications/${app.id}`}
                    className="text-sm font-medium text-[var(--color-text-primary)] hover:text-blue-600 truncate block"
                  >
                    {app.project?.title || "Project Application"}
                  </Link>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently"}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
                    statusStyles[app.status] || "bg-gray-100 text-gray-600 border-gray-200"
                  )}
                >
                  {app.status}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </section>
  );
}
