"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Trash2, SearchX } from "lucide-react";
import Link from "next/link";
import { StudentLayout } from "@/components/student/StudentLayout";
import { ApplicationProgress } from "@/components/student/applications";
import { sharedRepository } from "@/lib/shared-repository";
import { cn } from "@/lib/utils";
import type { Application, Project } from "@/types";

interface ApplicationDetailsPageProps {
  params: Promise<{ id: string }>;
}

const statusStyles: Record<Application["status"], string> = {
  Accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Shortlisted: "bg-blue-50 text-blue-700 border-blue-100",
  Pending: "bg-gray-100 text-gray-600 border-gray-200",
  Rejected: "bg-red-50 text-red-700 border-red-100",
  "Under Review": "bg-purple-50 text-purple-700 border-purple-100",
  Withdrawn: "bg-gray-200 text-gray-700 border-gray-300",
};

type AppWithProject = Application & { project: Project };

function loadAppData(id: string): AppWithProject | null {
  const apps = sharedRepository.getApplications();
  const app = apps.find(a => a.id === id);
  if (!app) return null;
  const projects = sharedRepository.getProjects();
  const project = projects.find(p => p.id === app.projectId);
  if (!project) return null;
  return { ...app, project };
}

export default function ApplicationDetailsPage({ params }: ApplicationDetailsPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [appData, setAppData] = useState<AppWithProject | null>(() => loadAppData(id));
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawn, setIsWithdrawn] = useState(false);

  // Live-sync: re-read from shared repo when status changes (e.g. Client shortlists/accepts in another tab)
  useEffect(() => {
    const refresh = () => {
      const updated = loadAppData(id);
      if (updated) setAppData(updated);
    };
    window.addEventListener("skillbridge_data_updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("skillbridge_data_updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [id]);

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
    // Guard: don't allow withdraw if already accepted
    if (application.status === "Accepted") return;
    sharedRepository.saveApplication({
      ...application,
      status: "Withdrawn",
      updatedAt: new Date().toISOString(),
    });
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

  const canWithdraw = application.status !== "Accepted" && application.status !== "Withdrawn" && application.status !== "Rejected";

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
                {project.client || "Client"} • Applied {new Date(application.appliedAt).toLocaleDateString()}
              </p>
            </div>
            <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold sm:self-center", statusStyles[application.status])}>
              {application.status}
            </span>
          </div>

          {/* Progress Tracker */}
          <div className="p-6">
            <ApplicationProgress status={application.status} />
          </div>
        </div>

        {/* Application Details */}
        <div className="mb-8 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-[var(--color-text-primary)]">Your Proposal</h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
            {application.proposal}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--color-border-subtle)] pt-6">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)]">Proposed Budget</p>
              <p className="mt-0.5 text-sm font-bold text-[var(--color-text-primary)]">
                {application.proposedBudget || project.budget}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)]">Estimated Completion</p>
              <p className="mt-0.5 text-sm font-bold text-[var(--color-text-primary)]">
                {application.estimatedCompletion || project.duration}
              </p>
            </div>
          </div>
        </div>

        {/* Project Summary */}
        <div className="mb-8 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-[var(--color-text-primary)]">Project Summary</h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.skills.map(skill => (
              <span key={skill} className="rounded-lg bg-[var(--color-canvas-surface)] px-3 py-1 text-xs font-medium text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        {canWithdraw && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 size={15} />
              Withdraw Application
            </button>
          </div>
        )}
      </motion.div>

      {/* Withdraw Confirmation Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowWithdrawModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h3 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">Withdraw Application?</h3>
              <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
                This will permanently withdraw your application for <strong>{project.title}</strong>. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 rounded-xl border border-[var(--color-border-subtle)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Yes, Withdraw
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </StudentLayout>
  );
}
