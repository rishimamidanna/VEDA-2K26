// @ts-nocheck
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Project as ClientProjectDetail, ApplicationStatus } from "@/types";
import {
  clientApplicationsRepository,
  type ProjectApplication,
} from "@/lib/client-applications-repository";

export interface ProjectApplicantsPipelineProps {
  project: ClientProjectDetail;
}

type FilterTab = "All" | "Shortlisted" | "Accepted" | "Rejected";

export function ProjectApplicantsPipeline({
  project,
}: ProjectApplicantsPipelineProps) {
  // Read applicants from the persistent repository
  const [applicants, setApplicants] = useState<ProjectApplication[]>(() =>
    clientApplicationsRepository.getApplicationsByProjectId(project.id)
  );
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Sync state when storage updates or external application added
  useEffect(() => {
    const handleUpdate = () => {
      setApplicants(clientApplicationsRepository.getApplicationsByProjectId(project.id));
    };

    window.addEventListener("skillbridge_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("skillbridge_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [project.id]);

  // Status transition handlers using the applications repository
  const handleUpdateStatus = (applicantId: string, newStatus: ApplicationStatus) => {
    // New signature: updateApplicationStatus(applicationId, newStatus)
    clientApplicationsRepository.updateApplicationStatus(applicantId, newStatus);
    const updated = clientApplicationsRepository.getApplicationsByProjectId(project.id);
    setApplicants(updated);

    const applicant = updated.find((a) => a.id === applicantId);
    const applicantName = applicant ? (applicant.name || "Candidate") : "Candidate";

    if (newStatus === "Shortlisted") {
      setFeedbackToast(`${applicantName} has been shortlisted.`);
    } else if (newStatus === "Accepted") {
      setFeedbackToast(`${applicantName} has been accepted!`);
    } else if (newStatus === "Rejected") {
      setFeedbackToast(`${applicantName} has been marked as rejected.`);
    } else if (newStatus === "Pending") {
      setFeedbackToast(`${applicantName} returned to review.`);
    }

    setRejectConfirmId(null);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    if (activeFilter === "All") return applicants;
    return applicants.filter((a) => a.status === activeFilter);
  }, [applicants, activeFilter]);

  const counts = useMemo(() => {
    return {
      All: applicants.length,
      Shortlisted: applicants.filter((a) => a.status === "Shortlisted").length,
      Accepted: applicants.filter((a) => a.status === "Accepted").length,
      Rejected: applicants.filter((a) => a.status === "Rejected").length,
    };
  }, [applicants]);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "Shortlisted":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "Accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200/60";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200/60";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
        <Link
          href="/client/dashboard"
          className="hover:text-[var(--color-text-primary)] transition-colors"
        >
          Dashboard
        </Link>
        <span className="text-[var(--color-text-tertiary)]">/</span>
        <Link
          href="/client/projects"
          className="hover:text-[var(--color-text-primary)] transition-colors"
        >
          My Projects
        </Link>
        <span className="text-[var(--color-text-tertiary)]">/</span>
        <Link
          href={`/client/projects/${project.id}`}
          className="hover:text-[var(--color-text-primary)] transition-colors truncate max-w-[160px] sm:max-w-xs"
        >
          {project.title}
        </Link>
        <span className="text-[var(--color-text-tertiary)]">/</span>
        <span className="font-medium text-[var(--color-text-primary)]">
          Applicants
        </span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-6 sm:p-8 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                Project Applicants
              </h1>
              <span className="inline-flex items-center rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#0071e3]">
                Demo pipeline
              </span>
            </div>
            <p className="mt-1 text-[13px] sm:text-[14px] text-[var(--color-text-secondary)]">
              Candidate proposals submitted for &ldquo;<span className="font-medium text-[var(--color-text-primary)]">{project.title}</span>&rdquo; ({project.budget} &bull; {project.status}).
            </p>
          </div>

          <Link
            href={`/client/projects/${project.id}`}
            className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-4 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] shadow-2xs self-start sm:self-auto"
          >
            &larr; View Project Spec
          </Link>
        </div>

        {/* Demo AI Matching Disclosure */}
        <div className="mt-3 rounded-xl bg-[var(--color-canvas-surface)] px-4 py-2.5 text-[12px] text-[var(--color-text-secondary)] flex items-center gap-2 border border-[var(--color-border-subtle)]">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0071e3]/15 text-[#0071e3] font-semibold text-[10px]">
            i
          </span>
          <span>
            Match scores are simulated demo indicators based on project required skills. Real automated matchmaking will be available in future releases.
          </span>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackToast && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-[13px] font-medium text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{feedbackToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {(["All", "Shortlisted", "Accepted", "Rejected"] as FilterTab[]).map((tab) => {
          const isSelected = activeFilter === tab;
          const count = counts[tab];

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] shrink-0",
                isSelected
                  ? "bg-[var(--color-text-primary)] text-white shadow-xs font-semibold"
                  : "bg-[var(--color-canvas-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-canvas-surface)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <span>{tab}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[11px] font-semibold",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-[var(--color-canvas-surface)] text-[var(--color-text-tertiary)]"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applicant Cards or Empty State */}
      {filteredApplicants.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-8 sm:p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-canvas-surface)] text-[var(--color-text-tertiary)]">
            <svg
              className="h-6 w-6"
              aria-hidden={true}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="text-[15px] sm:text-[16px] font-semibold text-[var(--color-text-primary)]">
            No {activeFilter === "All" ? "" : activeFilter.toLowerCase()} applicants found
          </h3>
          <p className="mt-1.5 max-w-sm text-[13px] sm:text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
            {activeFilter === "All"
              ? "This project does not have any applicant submissions yet."
              : `There are currently no candidates marked as ${activeFilter.toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredApplicants.map((applicant) => (
            <div
              key={applicant.id}
              className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 sm:p-7 shadow-2xs transition-all hover:border-[var(--color-border-hover)] space-y-5"
            >
              {/* Top Row: Avatar, Name, College, Demo Match Score, Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3]/15 via-[#5a6ef5]/20 to-[#9c71f7]/25 text-[#0071e3] font-bold text-[15px] shadow-2xs">
                    {applicant.avatarInitials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                        {applicant.name}
                      </h2>
                      {applicant.isUserCreated && (
                        <span className="inline-flex items-center rounded-full bg-[var(--color-canvas-surface)] border border-[var(--color-border-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                          Demo applicant
                        </span>
                      )}
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          getStatusBadge(applicant.status)
                        )}
                      >
                        {applicant.status}
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                      {applicant.headline}
                    </p>
                    <p
                      className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5"
                      dangerouslySetInnerHTML={{ __html: applicant.college }}
                    />
                  </div>
                </div>

                {/* Demo match score badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-3 py-1 text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[12px] font-semibold">{applicant.demoMatchScore || "90%"}</span>
                    <span className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium">demo match</span>
                  </div>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  Relevant Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {applicant.relevantSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Application Message */}
              <div className="rounded-xl bg-[var(--color-canvas-surface)] p-4 space-y-1.5 border border-[var(--color-border-subtle)]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  Application Pitch
                </span>
                <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed italic">
                  &ldquo;{applicant.proposal}&rdquo;
                </p>
              </div>

              {/* Portfolio Summary */}
              <div className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                <span className="font-semibold text-[var(--color-text-primary)]">Portfolio: </span>
                <span>{applicant.portfolioSummary}</span>
              </div>

              {/* Expanded Profile Drawer */}
              {selectedProfileId === applicant.id && (
                <div className="rounded-xl border border-[var(--color-border-subtle)] bg-white p-4 text-[13px] space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      Candidate Profile Details &bull; Demo Mode
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProfileId(null)}
                      className="text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">
                    Applied on: <span className="font-medium text-[var(--color-text-primary)]">{applicant.appliedAt}</span>
                  </p>
                  {applicant.portfolioUrl && (
                    <p className="text-[12px] text-[var(--color-text-secondary)]">
                      External Link:{" "}
                      <span className="font-medium text-[#0071e3] underline">
                        {applicant.portfolioUrl}
                      </span>
                    </p>
                  )}
                  <p className="text-[12px] text-[var(--color-text-tertiary)] pt-1">
                    Student identity is verified via institutional email.
                  </p>
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-3">
                {/* View Profile Toggle */}
                <button
                  type="button"
                  onClick={() => setSelectedProfileId(selectedProfileId === applicant.id ? null : applicant.id)}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-4 text-[12px] sm:text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] shadow-2xs transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  {selectedProfileId === applicant.id ? "Hide Profile" : "View Profile"}
                </button>

                {/* Candidate Decision Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* State 1: When Candidate is Accepted */}
                  {applicant.status === "Accepted" && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-4 text-[12px] sm:text-[13px] font-semibold text-emerald-800 shadow-2xs">
                        <span>Accepted candidate</span>
                        <span>Γ£ô</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(applicant.id, "Pending")}
                        className="text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline px-2 py-1 focus-visible:outline-hidden"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {/* State 2: When Candidate is Rejected */}
                  {applicant.status === "Rejected" && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 items-center rounded-full border border-red-200 bg-red-50 px-4 text-[12px] sm:text-[13px] font-medium text-red-700 shadow-2xs">
                        Application Rejected
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(applicant.id, "Pending")}
                        className="text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline px-2 py-1 focus-visible:outline-hidden"
                      >
                        Reopen
                      </button>
                    </div>
                  )}

                  {/* State 3: When Candidate is Applied or Shortlisted */}
                  {applicant.status !== "Accepted" && applicant.status !== "Rejected" && (
                    <>
                      {/* Shortlist Button */}
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(
                            applicant.id,
                            applicant.status === "Shortlisted" ? "Pending" : "Shortlisted"
                          )
                        }
                        className={cn(
                          "inline-flex h-9 items-center justify-center rounded-full border px-4 text-[12px] sm:text-[13px] font-medium shadow-2xs transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
                          applicant.status === "Shortlisted"
                            ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                            : "border-[var(--color-border-subtle)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)]"
                        )}
                      >
                        {applicant.status === "Shortlisted" ? "Shortlisted Γ£ô" : "Shortlist"}
                      </button>

                      {/* Accept Button */}
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(applicant.id, "Accepted")}
                        className="inline-flex h-9 items-center justify-center rounded-full border border-transparent bg-[var(--color-text-primary)] px-4 text-[12px] sm:text-[13px] font-medium text-white shadow-2xs transition-all hover:bg-black active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        Accept
                      </button>

                      {/* Reject with Safe Confirmation */}
                      {rejectConfirmId === applicant.id ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1">
                          <span className="text-[11px] font-semibold text-red-700 px-1">
                            Confirm reject?
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(applicant.id, "Rejected")}
                            className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold text-white hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectConfirmId(null)}
                            className="rounded-full border border-red-200 bg-white px-2 py-0.5 text-[11px] font-medium text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRejectConfirmId(applicant.id)}
                          className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-3.5 text-[12px] sm:text-[13px] font-medium text-[var(--color-text-secondary)] shadow-2xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          Reject
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
