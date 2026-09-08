import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getStudentById } from "@/lib/server/students/service";
import { getServerSession } from "@/lib/server/auth/context";
import { mapTalentStudent } from "@/lib/api-mappers";
import { StudentProfileView } from "@/components/client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const auth = await getServerSession();
  const result = await getStudentById(id, auth);

  if ("error" in result || !result.student) {
    return {
      title: "Student Not Found | Client Portal",
    };
  }

  return {
    title: `${result.student.name} (${result.student.headline}) | Student Profile | SkillBridge`,
    description: result.student.about,
  };
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const auth = await getServerSession();
  const result = await getStudentById(id, auth);

  if ("error" in result || !result.student) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-canvas-surface)] text-[var(--color-text-tertiary)]">
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Student Profile Not Found
        </h1>
        <p className="text-[14px] text-[var(--color-text-secondary)]">
          No student matching ID &ldquo;{id}&rdquo; was found in the talent directory.
        </p>

        <div className="pt-2">
          <Link
            href="/client/talent"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-6 text-[14px] font-medium text-white shadow-xs hover:bg-black"
          >
            Back to Talent Directory
          </Link>
        </div>
      </div>
    );
  }

  const student = mapTalentStudent(result.student);

  return <StudentProfileView student={student} />;
}
