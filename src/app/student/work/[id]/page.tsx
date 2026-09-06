"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, SearchX, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { StudentLayout } from "@/components/student/StudentLayout";
import {
  MilestoneList,
  DeliverablesList,
  ClientNotes,
  RecentActivity,
  SubmitWorkModal,
  SubmissionSuccess,
  WorkProjectProgress,
} from "@/components/student/work";
import { getWorkProject } from "@/data/work";
import { cn } from "@/lib/utils";
import type { WorkStatus } from "@/types";

interface WorkspacePageProps {
  params: Promise<{ id: string }>;
}

const statusStyles: Record<WorkStatus, string> = {
  "In Progress": "bg-blue-50 text-blue-700 border-blue-100",
  "Awaiting Review": "bg-purple-50 text-purple-700 border-purple-100",
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const router = useRouter();
  const { id } = use(params);

  // Local state to simulate workflow
  const [workData] = useState(() => getWorkProject(id));
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Derive status from local state (mocking the submission)
  const [currentStatus, setCurrentStatus] = useState<WorkStatus>(
    workData?.status || "In Progress"
  );
  const [progress, setProgress] = useState(workData?.progress || 0);

  if (!workData) {
    return (
      <StudentLayout title="Workspace">
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-canvas-surface)]">
            <SearchX size={28} className="text-[var(--color-text-secondary)]" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-[var(--color-text-primary)]">
            Project not found
          </h2>
          <button
            onClick={() => router.push("/student/work")}
            className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--color-text-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-text-secondary)] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to My Work
          </button>
        </div>
      </StudentLayout>
    );
  }

  const { project, ...work } = workData;

  const handleSubmitSuccess = () => {
    setIsSubmitModalOpen(false);
    setCurrentStatus("Awaiting Review");
    setProgress(100);
    setShowSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <StudentLayout title="Workspace">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-4xl pb-12"
      >
        <Link
          href="/student/work"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to My Work
        </Link>

        {showSuccess ? (
          <div className="mt-8 mb-8">
            <SubmissionSuccess 
              onBack={() => router.push("/student/work")} 
              clientName={project.client} 
            />
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-[var(--color-border-subtle)] pb-6">
              <div>
                <h1 className="mb-2 text-2xl font-bold text-[var(--color-text-primary)]">
                  {project.title}
                </h1>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {project.client}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                  <span className="font-semibold text-[var(--color-text-primary)]">{project.budget}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--color-border-subtle)]" />
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    Deadline: <span className="font-medium text-[var(--color-text-primary)]">{project.deadline}</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold", statusStyles[currentStatus])}>
                  {currentStatus}
                </span>
                <div className="mt-2 w-full sm:w-48">
                  <WorkProjectProgress progress={progress} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
              {/* Left Column */}
              <div>
                <div className="mb-10">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Project Overview
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
                    {project.fullDescription || project.description}
                  </p>
                </div>

                <MilestoneList milestones={work.milestones} />
                <DeliverablesList deliverables={work.deliverables} />
              </div>

              {/* Right Column */}
              <div>
                <ClientNotes notes={work.clientNotes} />
                <RecentActivity activities={work.recentActivity} />
                
                {/* Submit Action */}
                {currentStatus === "In Progress" && (
                  <div className="mt-8 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] p-5">
                    <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
                      Ready to submit?
                    </h3>
                    <p className="mb-4 text-xs text-[var(--color-text-secondary)]">
                      Ensure all deliverables are complete before submitting for review.
                    </p>
                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      Submit Work →
                    </button>
                  </div>
                )}
                {currentStatus === "Awaiting Review" && (
                  <div className="mt-8 rounded-2xl border border-purple-100 bg-purple-50 p-5 text-center">
                    <h3 className="mb-1 text-sm font-bold text-purple-900">
                      Awaiting Client Review
                    </h3>
                    <p className="text-xs text-purple-700">
                      You submitted your work and are waiting for the client&apos;s feedback.
                    </p>
                  </div>
                )}
                {currentStatus === "Completed" && (
                  <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
                    <div className="mb-2 flex justify-center text-emerald-600">
                      <CheckCircle2 size={24} />
                    </div>
                    <h3 className="mb-1 text-sm font-bold text-emerald-900">
                      Project Completed
                    </h3>
                    <p className="text-xs text-emerald-700">
                      Great job! This project is now part of your history.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <SubmitWorkModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleSubmitSuccess}
      />
    </StudentLayout>
  );
}
