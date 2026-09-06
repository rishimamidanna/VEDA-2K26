import React from "react";
import type { Metadata } from "next";
import { SEEDED_PROJECT_DETAILS } from "@/data/client-projects";
import { ClientProjectApplicantsClient } from "@/components/client/client-project-applicants-client";

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
      title: "Applicants | Client Portal | SkillBridge",
      description: "Review and manage candidate applications for client projects.",
    };
  }

  return {
    title: `Applicants: ${project.title} | Client Portal | SkillBridge`,
    description: `Review candidate proposals for ${project.title} on SkillBridge.`,
  };
}

export default async function ProjectApplicantsPage({ params }: PageProps) {
  const { id } = await params;
  const project = SEEDED_PROJECT_DETAILS[id] || null;

  return <ClientProjectApplicantsClient id={id} initialProject={project} />;
}
