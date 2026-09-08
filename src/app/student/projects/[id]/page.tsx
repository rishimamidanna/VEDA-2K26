"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, SearchX } from "lucide-react";
import { StudentLayout } from "@/components/student/StudentLayout";
import {
  ProjectHeader,
  ProjectMeta,
  SkillMatch,
  ProjectDescription,
  ProjectDeliverables,
  RequiredSkills,
  ClientCard,
  ApplyCard,
  ApplyModal,
  ApplicationSuccess,
} from "@/components/student";
import { apiClient } from "@/lib/api-client";
import { mapProject } from "@/lib/api-mappers";
import type { Project } from "@/types";

interface ProjectDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        // 1. Fetch project details
        const projectData = await apiClient.get<any>(`/api/projects/${id}`);
        if (isMounted && projectData) {
          setProject(mapProject(projectData));
        }

        // 2. Check if student already applied
        try {
          const appsData = await apiClient.get<any[]>("/api/applications");
          if (isMounted && Array.isArray(appsData)) {
            const already = appsData.some(
              (a) => a.projectId === id && a.status !== "WITHDRAWN"
            );
            setHasApplied(already);
          }
        } catch {
          // If unauthenticated or no applications yet, leave hasApplied as false
        }
      } catch (err) {
        console.error("Failed to load project:", err);
        if (isMounted) setProject(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <StudentLayout title="Project Details">
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-text-primary)] border-t-transparent" />
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
            Loading project details...
          </p>
        </div>
      </StudentLayout>
    );
  }

  if (!project) {
    return (
      <StudentLayout title="Project Details">
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-canvas-surface)]">
            <SearchX size={28} className="text-[var(--color-text-secondary)]" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-[var(--color-text-primary)]">
            Project not found
          </h2>
          <p className="mb-8 text-sm text-[var(--color-text-secondary)]">
            Sorry, we couldn&apos;t find this project. It might have been removed or closed.
          </p>
          <button
            onClick={() => router.push("/student/projects")}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-text-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-text-secondary)] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>
        </div>
      </StudentLayout>
    );
  }

  const handleApplySuccess = () => {
    setIsModalOpen(false);
    setHasApplied(true);
    setShowSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <StudentLayout title="Project Details">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto max-w-6xl xl:px-4">
          {showSuccess ? (
            <div className="mt-8">
              <ApplicationSuccess onBack={() => router.push("/student/projects")} />
            </div>
          ) : (
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start xl:gap-16">
              {/* Main Content Column */}
              <div className="flex-1 min-w-0 pb-12 pt-4">
                <ProjectHeader project={project} />
                <ProjectMeta project={project} />
                <SkillMatch project={project} />
                <ProjectDescription project={project} />
                <ProjectDeliverables project={project} />
                <RequiredSkills project={project} />
                <ClientCard project={project} />
              </div>

              {/* Sticky Sidebar / Apply Card */}
              <div className="hidden lg:block lg:w-[320px] xl:w-[360px] flex-shrink-0 pt-4 pb-12">
                <ApplyCard
                  project={project}
                  onApplyClick={() => setIsModalOpen(true)}
                  hasApplied={hasApplied}
                />
              </div>

              {/* Mobile Apply Card */}
              <div className="block lg:hidden w-full pb-12">
                <ApplyCard
                  project={project}
                  onApplyClick={() => setIsModalOpen(true)}
                  hasApplied={hasApplied}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={project}
        onSuccess={handleApplySuccess}
      />
    </StudentLayout>
  );
}
