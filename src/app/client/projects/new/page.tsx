import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PostProjectForm } from "@/components/client";

export const metadata: Metadata = {
  title: "Post a Project | Client Portal | SkillBridge",
  description: "Create and publish a micro-project opportunity for student freelancers on SkillBridge.",
};

export default function PostNewProjectPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
          <Link
            href="/client/dashboard"
            className="hover:text-[var(--color-text-primary)] transition-colors"
          >
            Dashboard
          </Link>
          <span className="text-[var(--color-text-tertiary)]">/</span>
          <span className="font-medium text-[var(--color-text-primary)]">
            Post a Project
          </span>
        </nav>

        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Post a Project
          </h1>
          <p className="mt-1 text-[14px] sm:text-[15px] text-[var(--color-text-secondary)]">
            Define your scope, skills, and student budget to connect with qualified candidates.
          </p>
        </div>
      </div>

      {/* Form Component */}
      <PostProjectForm />
    </div>
  );
}
