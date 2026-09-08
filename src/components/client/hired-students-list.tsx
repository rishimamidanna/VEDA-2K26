"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { formatPrismaProjectStatus } from "@/lib/api-mappers";

interface HiredStudentViewItem {
  id: string;
  studentName: string;
  avatarInitials: string;
  headline: string;
  college: string;
  projectTitle: string;
  projectStatus: string;
  proposal?: string;
  appliedAt?: string;
  skills: string[];
  studentProfileId?: string;
  escrow?: {
    id: string;
    status: string;
    amount: string | number;
  } | null;
}

export function HiredStudentsList() {
  const [hiredList, setHiredList] = useState<HiredStudentViewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function loadHired() {
    try {
      setIsLoading(true);
      const [workData, escrowsData] = await Promise.all([
        apiClient.get<any[]>("/api/work"),
        apiClient.get<any[]>("/api/escrows").catch(() => []),
      ]);

      const escrowMap = new Map<string, any>();
      if (Array.isArray(escrowsData)) {
        for (const esc of escrowsData) {
          if (esc.workContractId) {
            escrowMap.set(esc.workContractId, esc);
          }
        }
      }

      if (Array.isArray(workData)) {
        const items: HiredStudentViewItem[] = workData.map((contract) => {
          const studentUser = contract.student?.user;
          const studentName = studentUser?.name || "Student";
          const avatarInitials = (studentUser?.name || "ST")
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          const skills = Array.isArray(contract.student?.skills)
            ? contract.student.skills.map((s: any) => s.skill?.name || s.name || s)
            : [];

          const existingEscrow = escrowMap.get(contract.id) || null;

          return {
            id: contract.id,
            studentName,
            avatarInitials,
            headline: contract.student?.headline || "Student Builder",
            college: contract.student?.college || "University",
            projectTitle: contract.project?.title || `Project #${contract.projectId}`,
            projectStatus: formatPrismaProjectStatus(contract.project?.status),
            proposal: contract.application?.proposal,
            appliedAt: contract.application?.appliedAt,
            skills,
            studentProfileId: contract.student?.id,
            escrow: existingEscrow
              ? {
                  id: existingEscrow.id,
                  status: existingEscrow.status,
                  amount: existingEscrow.amount,
                }
              : null,
          };
        });
        setHiredList(items);
      }
    } catch (err) {
      console.error("Failed to load hired students:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHired();
  }, []);

  async function handleFundEscrow(contractId: string) {
    try {
      setActionLoadingId(contractId);
      setActionMessage(null);
      await apiClient.post("/api/payments", { workContractId: contractId });
      setActionMessage("Escrow successfully funded (Demo).");
      await loadHired();
    } catch (err: any) {
      setActionMessage(`Funding failed: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReleaseEscrow(escrowId: string) {
    try {
      setActionLoadingId(escrowId);
      setActionMessage(null);
      await apiClient.post(`/api/escrows/${escrowId}/release`);
      setActionMessage("Escrow released to student wallet (Demo).");
      await loadHired();
    } catch (err: any) {
      setActionMessage(`Release failed: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoadingId(null);
    }
  }

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
          href="/client/projects"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-text-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors"
        >
          View Projects
        </Link>
      </div>

      {/* Demo Escrow Notice */}
      <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 text-xs text-blue-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
            Demo Payment
          </span>
          <span>Demo Payment — No real money is charged. Demo Escrow — No real funds are held.</span>
        </div>
        {actionMessage && (
          <span className="font-semibold text-emerald-700">{actionMessage}</span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-text-primary)] border-t-transparent" />
          <span className="mt-3 text-[13px] font-medium text-[var(--color-text-secondary)]">
            Loading hired talent...
          </span>
        </div>
      ) : totalHired === 0 ? (
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
            Accept applicants from your projects to initiate active work contracts and see them here.
          </p>
          <div className="flex gap-3">
            <Link
              href="/client/projects"
              className="rounded-xl border border-[var(--color-border-subtle)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
            >
              View Projects
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {hiredList.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Student Info */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-sm font-bold text-[var(--color-accent)]">
                    {item.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--color-text-primary)]">
                        {item.studentName}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100">
                        Contract Active
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                      {item.headline}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {item.college}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* Escrow Status & Action */}
                  {!item.escrow ? (
                    <button
                      type="button"
                      disabled={actionLoadingId === item.id}
                      onClick={() => handleFundEscrow(item.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {actionLoadingId === item.id ? "Funding..." : "Fund Escrow (Demo)"}
                    </button>
                  ) : item.escrow.status === "HELD" ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                        Escrow: ${parseFloat(String(item.escrow.amount)).toFixed(2)} (Held)
                      </span>
                      <button
                        type="button"
                        disabled={actionLoadingId === item.escrow.id}
                        onClick={() => handleReleaseEscrow(item.escrow!.id)}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {actionLoadingId === item.escrow.id ? "Releasing..." : "Release Escrow (Demo)"}
                      </button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                      Escrow Released (${parseFloat(String(item.escrow.amount)).toFixed(2)})
                    </span>
                  )}

                  <Link
                    href="/client/projects"
                    className="rounded-lg bg-[var(--color-text-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-black transition-colors"
                  >
                    View Projects
                  </Link>
                </div>
              </div>

              {/* Project + Skills */}
              <div className="mt-4 border-t border-[var(--color-border-subtle)] pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)] font-medium">Working on</p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">
                    {item.projectTitle}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Status: <span className="font-medium text-[var(--color-text-primary)]">{item.projectStatus}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(item.skills || []).slice(0, 4).map((skill: string) => (
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
              {item.proposal && (
                <div className="mt-3">
                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                    &ldquo;{item.proposal}&rdquo;
                  </p>
                </div>
              )}

              {/* Meta */}
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                Contract started:{" "}
                <span className="font-medium text-[var(--color-text-primary)]">
                  {item.appliedAt ? new Date(item.appliedAt).toLocaleDateString() : "Active"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
