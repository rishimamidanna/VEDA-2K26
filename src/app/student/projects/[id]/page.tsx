"use client";

import { use, useState } from "react";
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
import { useSharedProjects, sharedRepository } from "@/lib/shared-repository";

interface ProjectDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const router = useRouter();
  
  // React 19 unwrapping pattern for dynamic route params
  const { id } = use(params);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load projects from shared repository (includes client-created projects)
  const allProjects = useSharedProjects();
  const project = allProjects.find((p) => p.id === id);

  // Pre-check if this student already applied — keeps Apply button disabled on reload
  const existingApps = sharedRepository.getApplications();
  const [hasApplied, setHasApplied] = useState(
    existingApps.some(a => a.projectId === id && a.studentId === "student-1")
  );

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
            Sorry, we couldn&apos;t find this project. It might have been removed.
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
