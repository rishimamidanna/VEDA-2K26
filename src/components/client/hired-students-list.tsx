// @ts-nocheck
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

    // Match with known student talent profile by name or explicit studentId
    const matchedProfile = allStudents.find(
      (s) => s.id === app.studentId || s.name.toLowerCase() === (app.name || "").toLowerCase()
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

    // Use the unified event name from sharedRepository
    window.addEventListener("skillbridge_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("skillbridge_data_updated", handleUpdate);
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
        <span aria-hidden="true">/</span>
        <span className="text-[var(--color-text-primary)] font-medium">Hired Students</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Hired Students
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {totalHired > 0
              ? `${totalHired} student${totalHired !== 1 ? "s" : ""} currently working with you`
              : "No students hired yet"}
          </p>
        </div>
        <Link
          href="/client/talent"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-text-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors"
        >
          Find More Talent
        </Link>
      </div>

      {/* Content */}
      {totalHired === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-canvas-surface)] border border-[var(--color-border-subtle)]">
            <svg className="h-8 w-8 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            No hired students yet
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mb-6">
            Accept applicants from your projects to see them here.
          </p>
          <div className="flex gap-3">
            <Link
              href="/client/projects"
              className="rounded-xl border border-[var(--color-border-subtle)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
            >
              View Projects
            </Link>
            <Link
              href="/client/talent"
              className="rounded-xl bg-[var(--color-text-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors"
            >
              Find Talent
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {hiredList.map(({ application: app, projectTitle, projectStatus, studentProfileId }) => (
            <div
              key={app.id}
              className="rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Student Info */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-sm font-bold text-[var(--color-accent)]">
                    {app.avatarInitials || (app.name || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--color-text-primary)]">
                        {app.name || "Student"}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100">
                        Accepted
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                      {app.headline || "Student Developer"}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {app.college || ""}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {studentProfileId && (
                    <Link
                      href={`/client/talent/${studentProfileId}`}
                      className="rounded-lg border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
                    >
                      View Profile
                    </Link>
                  )}
                  <Link
                    href="/client/projects"
                    className="rounded-lg bg-[var(--color-text-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-black transition-colors"
                  >
                    View Project
                  </Link>
                </div>
              </div>

              {/* Project + Skills */}
              <div className="mt-4 border-t border-[var(--color-border-subtle)] pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)] font-medium">Working on</p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">
                    {projectTitle}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Project status:{" "}
                    <span className="font-medium text-[var(--color-text-primary)]">{projectStatus}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(app.relevantSkills || []).slice(0, 4).map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-[var(--color-canvas-surface)] border border-[var(--color-border-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-primary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Proposal summary */}
              {app.proposal && (
                <div className="mt-3">
                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                    &ldquo;{app.proposal}&rdquo;
                  </p>
                </div>
              )}

              {/* Meta */}
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                Applied:{" "}
                <span className="font-medium text-[var(--color-text-primary)]">
                  {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "—"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
