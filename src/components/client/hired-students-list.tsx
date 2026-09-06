"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  clientApplicationsRepository,
  type ProjectApplication,
} from "@/lib/client-applications-repository";
import { clientProjectsRepository } from "@/lib/client-projects-repository";
import { studentTalentRepository } from "@/lib/student-talent-repository";

interface HiredStudentViewItem {
  application: ProjectApplication;
  projectTitle: string;
  projectStatus: string;
  studentProfileId?: string;
}

function loadHiredStudents(): HiredStudentViewItem[] {
  const acceptedApps = clientApplicationsRepository.getAcceptedApplications();
  const allStudents = studentTalentRepository.getAllStudents();

  return acceptedApps.map((app) => {
    const project = clientProjectsRepository.getProjectById(app.projectId);
    const projectTitle = project ? project.title : `Project #${app.projectId}`;
    const projectStatus = project ? project.status : "In Progress";

    // Match with known student talent profile by name or explicit studentId if present
    const matchedProfile = allStudents.find(
      (s) => s.id === app.studentId || s.name.toLowerCase() === app.studentName.toLowerCase()
    );

    return {
      application: app,
      projectTitle,
      projectStatus,
      studentProfileId: matchedProfile ? matchedProfile.id : undefined,
    };
  });
}

export function HiredStudentsList() {
  const [hiredList, setHiredList] = useState<HiredStudentViewItem[]>(() => loadHiredStudents());

  const refreshHiredStudents = useCallback(() => {
    setHiredList(loadHiredStudents());
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      refreshHiredStudents();
    };

    window.addEventListener("skillbridge_applications_updated", handleUpdate);
    window.addEventListener("skillbridge_projects_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("skillbridge_applications_updated", handleUpdate);
      window.removeEventListener("skillbridge_projects_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refreshHiredStudents]);

  const totalHired = hiredList.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]"
      >
        <Link
          href="/client/dashboard"
          className="hover:text-[var(--color-text-primary)] transition-colors"
        >
          Dashboard
        </Link>
        <span className="text-[var(--color-text-tertiary)]">/</span>
        <span className="font-medium text-[var(--color-text-primary)]">
          Hired Students
        </span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-6 sm:p-8 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                Hired Students
              </h1>
              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                {totalHired} Active Hires
              </span>
            </div>
            <p className="mt-1 text-[13px] sm:text-[14px] text-[var(--color-text-secondary)]">
              All students whose proposals have been accepted across your projects.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/client/projects"
              className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-4 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] shadow-2xs transition-all"
            >
              My Projects
            </Link>
            <Link
              href="/client/talent"
              className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-4 text-[13px] font-medium text-white shadow-2xs hover:bg-black transition-all"
            >
              Find More Talent
            </Link>
          </div>
        </div>
      </div>

      {/* Hired Student Cards or Empty State */}
      {hiredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-8 sm:p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-canvas-surface)] text-[var(--color-text-tertiary)]">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">
            No Hired Students Yet
          </h2>
          <p className="mt-1.5 max-w-sm text-[13px] sm:text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
            When you accept an applicant&apos;s proposal on any of your projects, they will automatically appear here.
          </p>
          <div className="mt-5">
            <Link
              href="/client/projects"
              className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-5 text-[13px] font-medium text-white shadow-2xs hover:bg-black transition-all"
            >
              Review Project Applicants
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {hiredList.map(({ application, projectTitle, projectStatus, studentProfileId }) => (
            <div
              key={application.id}
              className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 sm:p-7 shadow-2xs transition-all hover:border-[var(--color-border-hover)] space-y-5"
            >
              {/* Top Row: Avatar, Student Info, Badges */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 via-[#0071e3]/15 to-[#5a6ef5]/20 text-emerald-800 font-bold text-[15px] shadow-2xs">
                    {application.avatarInitials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
                        {application.studentName}
                      </h2>
                      {application.isSeededDemo && (
                        <span className="inline-flex items-center rounded-full bg-[var(--color-canvas-surface)] border border-[var(--color-border-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                          Demo record
                        </span>
                      )}
                      <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        Accepted Hire ✓
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                      {application.studentHeadline}
                    </p>
                    <p
                      className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5"
                      dangerouslySetInnerHTML={{ __html: application.college }}
                    />
                  </div>
                </div>

                {/* Accepted Date Badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-canvas-surface)] border border-[var(--color-border-subtle)] px-3 py-1 text-[12px] text-[var(--color-text-secondary)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Accepted on: <strong className="font-semibold text-[var(--color-text-primary)]">{application.appliedDate}</strong></span>
                  </div>
                </div>
              </div>

              {/* Project Association Info Box */}
              <div className="rounded-xl bg-[var(--color-canvas-surface)] p-4 border border-[var(--color-border-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Assigned Project
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                      {projectTitle}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                      {projectStatus}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/client/projects/${application.projectId}`}
                  className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-3.5 text-[12px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] shadow-2xs self-start sm:self-auto transition-colors"
                >
                  View Project &rarr;
                </Link>
              </div>

              {/* Skills Tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  Student Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {application.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Portfolio Summary */}
              {application.portfolioSummary && (
                <div className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                  <span className="font-semibold text-[var(--color-text-primary)]">Portfolio: </span>
                  <span>{application.portfolioSummary}</span>
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
                  <span>Application Status:</span>
                  <span className="font-semibold text-emerald-700">Accepted Candidate</span>
                </div>

                <div className="flex items-center gap-2.5">
                  {studentProfileId ? (
                    <Link
                      href={`/client/talent/${studentProfileId}`}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-4 text-[12px] sm:text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] shadow-2xs transition-all"
                    >
                      View Student Profile
                    </Link>
                  ) : (
                    <Link
                      href={`/client/projects/${application.projectId}/applicants`}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-4 text-[12px] sm:text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] shadow-2xs transition-all"
                    >
                      View Student Proposal
                    </Link>
                  )}

                  <Link
                    href={`/client/projects/${application.projectId}`}
                    className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-4 text-[12px] sm:text-[13px] font-medium text-white shadow-2xs hover:bg-black transition-all"
                  >
                    View Project Spec
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
