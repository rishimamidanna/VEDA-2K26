"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Trash2, SearchX } from "lucide-react";
import Link from "next/link";
import { StudentLayout } from "@/components/student/StudentLayout";
import { ApplicationProgress } from "@/components/student/applications";
import { getApplicationWithProject } from "@/data/applications";
import { cn } from "@/lib/utils";
import type { Application } from "@/types";

interface ApplicationDetailsPageProps {
  params: Promise<{ id: string }>;
}

const statusStyles: Record<Application["status"], string> = {
  Accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Shortlisted: "bg-blue-50 text-blue-700 border-blue-100",
  Pending: "bg-gray-100 text-gray-600 border-gray-200",
  Rejected: "bg-red-50 text-red-700 border-red-100",
};

export default function ApplicationDetailsPage({ params }: ApplicationDetailsPageProps) {
  const router = useRouter();
  const { id } = use(params);

  // Use a local state for the application to handle frontend-only mock withdrawal
  const [appData, setAppData] = useState(() => getApplicationWithProject(id));
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawn, setIsWithdrawn] = useState(false);

  if (!appData) {
    return (
      <StudentLayout title="Application Details">
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-canvas-surface)]">
            <SearchX size={28} className="text-[var(--color-text-secondary)]" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-[var(--color-text-primary)]">
            Application not found
          </h2>
          <button
            onClick={() => router.push("/student/applications")}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-text-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-text-secondary)] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Applications
          </button>
        </div>
      </StudentLayout>
    );
  }

  const { project, ...application } = appData;

  const handleWithdraw = () => {
    setShowWithdrawModal(false);
    setIsWithdrawn(true);
  };

  if (isWithdrawn) {
    return (
      <StudentLayout title="Application Details">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto mt-12 max-w-lg rounded-2xl border border-[var(--color-border-subtle)] bg-white p-8 text-center"
        >
          <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <Trash2 size={24} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-[var(--color-text-primary)]">
            Application Withdrawn
          </h2>
          <p className="mb-8 text-sm text-[var(--color-text-secondary)]">
            You have successfully withdrawn your application for {project.title}.
          </p>
          <button
            onClick={() => router.push("/student/applications")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-text-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-text-secondary)] transition-colors"
          >
            Back to Applications
          </button>
        </motion.div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Application Details">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl pb-12"
      >
        <Link
          href="/student/applications"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Applications
        </Link>

        {/* Status Header Banner */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[var(--color-border-subtle)] p-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-1 text-2xl font-bold text-[var(--color-text-primary)]">
                {project.title}
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {project.client} • Applied {application.appliedAt}
              </p>
            </div>
            <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold sm:self-center", statusStyles[application.status])}>
              {application.status}
            </span>
          </div>
          
          {application.status !== "Rejected" && (
            <div className="bg-[var(--color-canvas-surface)] p-6">
              <ApplicationProgress status={application.status} />
            </div>
          )}
        </div>

        {/* Application Details Content */}
        <div className="mb-8 flex flex-col gap-8 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 sm:p-8">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Your Proposal
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap">
              {application.proposal}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Proposed Budget
              </h3>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {application.proposedBudget}
              </p>
            </div>
            <div>
              <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Estimated Completion
              </h3>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {application.estimatedCompletion}
              </p>
            </div>
          </div>
        </div>

        {/* Actions based on status */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {application.status === "Accepted" ? (
              <Link
                href="/student/work"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                View in My Work
                <ArrowRight size={16} />
              </Link>
            ) : application.status === "Rejected" ? (
              <Link
                href="/student/projects"
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-text-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-text-secondary)] transition-colors"
              >
                Find More Projects
                <ArrowRight size={16} />
              </Link>
            ) : null}

            <Link
              href={`/student/projects/${project.id}`}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors",
                application.status === "Accepted" || application.status === "Rejected"
                  ? "border border-[var(--color-border-subtle)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)]"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              View Project Details
              <ArrowRight size={16} />
            </Link>
          </div>

          {application.status === "Pending" && (
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors sm:w-auto"
            >
              <Trash2 size={16} />
              Withdraw Application
            </button>
          )}
        </div>
      </motion.div>

      {/* Withdraw Confirmation Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowWithdrawModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 size={24} />
              </div>
              <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">
                Withdraw application?
              </h2>
              <p className="mb-8 text-sm text-[var(--color-text-secondary)]">
                Are you sure you want to withdraw your application for <strong>{project.title}</strong>? This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Withdraw Application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </StudentLayout>
  );
}
