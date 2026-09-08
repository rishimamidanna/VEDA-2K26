"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProjectApplicantsPipeline } from "@/components/client";
import { apiClient } from "@/lib/api-client";
import { mapProject } from "@/lib/api-mappers";
import type { Project as ClientProjectDetail } from "@/types";

interface ClientProjectApplicantsClientProps {
  id: string;
  initialProject: ClientProjectDetail | null;
}

export function ClientProjectApplicantsClient({
  id,
  initialProject,
}: ClientProjectApplicantsClientProps) {
  const [project, setProject] = useState<ClientProjectDetail | null>(
    initialProject
  );
  const [isLoading, setIsLoading] = useState(!initialProject);

  useEffect(() => {
    let isMounted = true;
    async function loadProject() {
      try {
        const data = await apiClient.get<any>(`/api/projects/${id}`);
        if (isMounted && data) {
          setProject(mapProject(data));
        }
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProject();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-text-primary)] border-t-transparent" />
        <span className="mt-3 text-[13px] font-medium text-[var(--color-text-secondary)]">
          Loading project...
        </span>
      </div>
    );
  }

  if (!project) {
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
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="12.01" x2="12" y2="16" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Project Not Found
        </h1>
        <p className="text-[14px] text-[var(--color-text-secondary)]">
          No project matching ID &ldquo;{id}&rdquo; was found in your client workspace.
        </p>

        <div className="pt-2">
          <Link
            href="/client/projects"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-6 text-[14px] font-medium text-white shadow-xs hover:bg-black"
          >
            Back to My Projects
          </Link>
        </div>
      </div>
    );
  }

  return <ProjectApplicantsPipeline project={project} />;
}
