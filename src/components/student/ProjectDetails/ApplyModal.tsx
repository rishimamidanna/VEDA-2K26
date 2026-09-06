"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Project, Application } from "@/types";
import { sharedRepository } from "@/lib/shared-repository";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSuccess: () => void;
}

export function ApplyModal({ isOpen, onClose, project, onSuccess }: ApplyModalProps) {
  const [proposal, setProposal] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState((project.budgetValue ?? 0).toString());
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<{ proposal?: string; duration?: string; budget?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!proposal.trim()) newErrors.proposal = "Proposal is required.";
    if (!duration) newErrors.duration = "Estimated completion time is required.";
    if (!budget.trim() || isNaN(Number(budget))) newErrors.budget = "Valid proposed budget is required.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const existingApps = sharedRepository.getApplications();
      const alreadyApplied = existingApps.some(a => a.projectId === project.id && a.studentId === "student-1");
      if (alreadyApplied) {
        alert("Already Applied");
        return;
      }
      
      const newApp: Application = {
        id: `app-${Date.now()}`,
        projectId: project.id,
        studentId: "student-1",
        status: "Pending",
        proposal: proposal,
        proposedBudget: `₹${budget}`,
        estimatedCompletion: duration,
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: "Alex Johnson",
        avatarInitials: "AJ",
        headline: "Frontend Developer",
        college: "State University",
        relevantSkills: project.skills,
        portfolioSummary: "Great projects in React and Next.js",
      };
      
      sharedRepository.saveApplication(newApp);
      onSuccess();
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                  Apply for {project.title}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Tell the client why you&apos;re a good fit for this project.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[var(--color-text-secondary)] hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
              <form id="apply-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Proposal */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
                    1. Proposal <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="Write a short proposal highlighting your relevant experience and approach to this project..."
                    className={`w-full rounded-xl border p-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors ${
                      errors.proposal ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-[var(--color-border-subtle)] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    }`}
                  />
                  {errors.proposal && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{errors.proposal}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Duration */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
                      2. Estimated completion time <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className={`w-full rounded-xl border p-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors ${
                        errors.duration ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-[var(--color-border-subtle)] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      }`}
                    >
                      <option value="" disabled>Select duration</option>
                      <option value="1 week">1 week</option>
                      <option value="2 weeks">2 weeks</option>
                      <option value="3 weeks">3 weeks</option>
                      <option value="More than 3 weeks">More than 3 weeks</option>
                    </select>
                    {errors.duration && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">{errors.duration}</p>
                    )}
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
                      3. Your proposed budget <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] font-medium">₹</span>
                      <input
                        type="text"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className={`w-full rounded-xl border py-3 pl-8 pr-4 text-sm text-[var(--color-text-primary)] outline-none transition-colors ${
                          errors.budget ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-[var(--color-border-subtle)] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        }`}
                      />
                    </div>
                    {errors.budget && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">{errors.budget}</p>
                    )}
                  </div>
                </div>

                {/* Optional Message */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
                    4. Optional message (e.g. link to similar work)
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Any additional context..."
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border-subtle)] bg-white px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="apply-form"
                disabled={isSubmitting}
                className="group flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
                {!isSubmitting && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ApplicationSuccess({ onBack }: { onBack: () => void }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/50 py-16 px-6 text-center shadow-sm"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
        <CheckCircle2 size={40} />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-[var(--color-text-primary)]">
        Application submitted
      </h2>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Your proposal has been successfully sent to the client. We&apos;ll notify you when they respond or review your application.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => router.push("/student/applications")}
          className="group flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          View My Applications
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
        <button
          onClick={onBack}
          className="rounded-xl border border-[var(--color-border-subtle)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
        >
          Back to Projects
        </button>
      </div>
    </motion.div>
  );
}
