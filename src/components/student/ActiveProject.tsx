"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Briefcase } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { mapWorkContract } from "@/lib/api-mappers";
import type { WorkProject, Project } from "@/types";
import Link from "next/link";

type WorkWithProject = WorkProject & { project: Project };

export function ActiveProject() {
  const [activeWork, setActiveWork] = useState<WorkWithProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiClient
      .get<any[]>("/api/work")
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item) => mapWorkContract(item) as WorkWithProject);
          const inProgress = mapped.find((w) => w.status === "In Progress") || mapped[0];
          setActiveWork(inProgress);
        }
      })
      .catch(() => {})
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
        className="mb-4"
      >
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Active Work</h2>
        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
          Your current project in progress.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}
        className="rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 transition-shadow"
      >
        {loading ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">
            Loading active work...
          </div>
        ) : !activeWork ? (
          <div className="py-6 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">No active contracts</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Accepted applications become active work contracts here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)] truncate">
                {activeWork.project?.title || "Active Contract"}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                <Calendar size={13} />
                <span>Due: {activeWork.dueDate || "Flexible"}</span>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--color-text-secondary)]">Progress</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {activeWork.progress}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-canvas-surface)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${activeWork.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                  />
                </div>
              </div>
            </div>

            <Link
              href={`/student/work/${activeWork.id}`}
              className="group flex items-center gap-2 self-start rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-white hover:border-transparent transition-all sm:self-center flex-shrink-0"
            >
              Continue working
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </motion.div>
    </section>
  );
}
