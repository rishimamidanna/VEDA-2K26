"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, UploadCloud, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface SubmitWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  onSuccess: (updatedContract?: any) => void;
}

export function SubmitWorkModal({ isOpen, onClose, contractId, onSuccess }: SubmitWorkModalProps) {
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedMessage = message.trim();
    const trimmedLink = link.trim();

    if (!trimmedMessage && !trimmedLink && !file) {
      setError("Please provide a submission message, link, or attachment.");
      return;
    }

    if (!trimmedMessage) {
      setError("Submission message is required.");
      return;
    }

    if (trimmedLink) {
      try {
        const url = new URL(trimmedLink.startsWith("http") ? trimmedLink : `https://${trimmedLink}`);
        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error();
        }
      } catch {
        setError("Please enter a valid URL (e.g. https://github.com/...)");
        return;
      }
    }

    if (file && file.size > 25 * 1024 * 1024) {
      setError("File exceeds maximum permitted size of 25MB.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      let uploadedFile: any = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "WORK_DELIVERABLE");
        formData.append("contextId", contractId);

        uploadedFile = await apiClient.upload<any>("/api/files/upload", formData);
      }

      const formattedLink = trimmedLink
        ? trimmedLink.startsWith("http")
          ? trimmedLink
          : `https://${trimmedLink}`
        : null;

      const activityParts = [`Submitted: ${trimmedMessage}`];
      if (formattedLink) {
        activityParts.push(`Link: ${formattedLink}`);
      }
      if (uploadedFile?.originalName || file?.name) {
        activityParts.push(`Attachment: ${uploadedFile?.originalName || file?.name}`);
      }
      const lastActivity = activityParts.join(" • ");

      const result = await apiClient.patch<any>(`/api/work/${contractId}`, {
        status: "AWAITING_REVIEW",
        progress: 100,
        lastActivity,
      });

      setMessage("");
      setLink("");
      setFile(null);
      setError(null);

      onSuccess(result?.contract || result);
    } catch (err: any) {
      setError(err?.message || "Failed to submit work deliverables. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                  Submit your work
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Share your completed work with the client for review.
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
              <form id="submit-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700 flex items-center justify-between">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="text-red-500 hover:text-red-700 font-bold ml-2"
                      aria-label="Dismiss error"
                    >
                      &times;
                    </button>
                  </div>
                )}
                
                {/* Message */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
                    1. Submission message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    placeholder="Describe what you've completed and any important notes for the client..."
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
                    2. Submission link (optional)
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => {
                      setLink(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
                    3. Optional attachment
                  </label>
                  <div className="flex w-full items-center justify-center">
                    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pb-6 pt-5 text-center">
                        <UploadCloud size={24} className="mb-2 text-gray-400" />
                        <p className="mb-1 text-sm text-gray-500">
                          <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">ZIP, PDF, images (MAX. 25MB)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setFile(e.target.files[0]);
                            if (error) setError(null);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {file && (
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs text-blue-800">
                      <span className="truncate font-medium">Selected file: {file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="ml-2 text-blue-500 hover:text-blue-700 font-bold"
                        title="Remove file"
                        aria-label="Remove file"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border-subtle)] bg-white px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="submit-form"
                disabled={isSubmitting || !message.trim()}
                className="group flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit for Review</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SubmissionSuccess({ onBack, clientName }: { onBack: () => void, clientName: string }) {
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
        Work submitted for review
      </h2>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Your submission has been sent to {clientName}. You&apos;ll be notified when they provide feedback.
      </p>
      
      <button
        onClick={onBack}
        className="rounded-xl border border-[var(--color-border-subtle)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
      >
        Back to My Work
      </button>
    </motion.div>
  );
}
