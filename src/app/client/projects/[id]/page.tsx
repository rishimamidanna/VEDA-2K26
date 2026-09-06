import React from "react";
import type { Metadata } from "next";
import { SEEDED_PROJECT_DETAILS } from "@/data/client-projects";
import { ClientProjectDetailClient } from "@/components/client/client-project-detail-client";
import type { Project } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return Object.keys(SEEDED_PROJECT_DETAILS).map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = SEEDED_PROJECT_DETAILS[id];

  if (!project) {
    return {
      title: "Project Details | Client Portal | SkillBridge",
      description: "Review and manage project scope, requirements, and deliverables.",
    };
  }

  return {
    title: `${project.title} | Client Projects | SkillBridge`,
    description: project.description,
  };
}

export default async function ClientProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const seeded = SEEDED_PROJECT_DETAILS[id];

  // Normalize seeded ClientProjectDetail to canonical Project shape
  const project: Project | null = seeded
    ? {
        id: seeded.id,
        clientId: seeded.clientId || "client_seed",
        title: seeded.title,
        description: seeded.description,
        category: seeded.category,
        skills: seeded.skills,
        budget: seeded.budget,
        duration: seeded.duration,
        experienceLevel: seeded.experienceLevel,
        deliverables: seeded.deliverables,
        deadline: seeded.deadline,
        status: seeded.status as Project["status"],
        postedAt: seeded.postedDate || new Date().toISOString(),
        createdAt: seeded.createdAt,
        applicantsCount: seeded.applicantsCount,
        timelineNote: seeded.timelineNote,
      }
    : null;

  return <ClientProjectDetailClient id={id} initialProject={project} />;
}
