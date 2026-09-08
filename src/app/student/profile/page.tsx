"use client";

import { useState, useEffect, useCallback } from "react";
import { StudentLayout } from "@/components/student/StudentLayout";
import {
  ProfileHeader,
  ProfileStats,
  AboutSection,
  SkillsSection,
  SkillProfile,
  ExperienceEducationSection,
  ProfileVisibility,
  PortfolioSection,
  SkillBridgeProjects,
  ClientReviews,
  EditProfileModal,
  AddPortfolioModal,
  ShareProfileModal,
} from "@/components/student/profile";
import { useStudentAuth } from "@/components/student/student-auth-context";
import { apiClient } from "@/lib/api-client";
import { mapStudentProfile, mapWorkContract } from "@/lib/api-mappers";
import type { StudentProfile, PortfolioProject, WorkProject, Project } from "@/types";
import { Loader2, AlertCircle } from "lucide-react";

function StudentProfileContent() {
  const { user, isLoading: isAuthLoading } = useStudentAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [completedProjects, setCompletedProjects] = useState<(WorkProject & { project: Project })[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [isVisibilitySaving, setIsVisibilitySaving] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Target student id: authenticated student or canonical demo student
  const studentTargetId = user?.studentProfile?.id || user?.id || "student-1";

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<any>(`/api/students/${studentTargetId}`);
      if (data) {
        setProfile(mapStudentProfile(data));
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load student profile");
    } finally {
      setIsLoading(false);
    }
  }, [studentTargetId]);

  const loadWorkContracts = useCallback(async () => {
    try {
      setIsProjectsLoading(true);
      const data = await apiClient.get<any[]>("/api/work");
      if (Array.isArray(data)) {
        const mapped = data
          .map((c) => mapWorkContract(c))
          .filter((w) => Boolean(w && w.status === "Completed"));
        setCompletedProjects(mapped);
      }
    } catch (err: any) {
      console.error("Failed to load completed work contracts:", err);
    } finally {
      setIsProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      loadProfile();
      loadWorkContracts();
    }
  }, [isAuthLoading, loadProfile, loadWorkContracts]);

  // SkillBridge reviews: extract from real completed projects if any exist
  const reviews = completedProjects
    .filter((w) => Boolean(w.review && w.rating))
    .map((w) => ({
      id: w.id,
      rating: w.rating!,
      review: w.review!,
      client: typeof w.project.client === "string" ? w.project.client : "Client",
    }));

  const handleToggleVisibility = async () => {
    if (!profile || isVisibilitySaving) return;
    const previousState = profile.isPublic;
    const nextState = !previousState;

    setIsVisibilitySaving(true);
    try {
      // Call authenticated student profile update API to persist in PostgreSQL
      const updated = await apiClient.patch<any>(`/api/students/${profile.id}`, {
        isPublic: nextState,
      });

      if (updated) {
        setProfile(mapStudentProfile(updated));
      } else {
        setProfile((prev) => (prev ? { ...prev, isPublic: nextState } : null));
      }
    } catch (err: any) {
      // Revert if API fails
      setProfile((prev) => (prev ? { ...prev, isPublic: previousState } : null));
      alert(err?.message || "Failed to update profile visibility.");
    } finally {
      setIsVisibilitySaving(false);
    }
  };

  const handleSaveProfile = async (updated: StudentProfile) => {
    if (!profile) return;
    try {
      const payload = {
        name: updated.name,
        headline: updated.headline,
        about: updated.about,
        location: updated.location,
        availability: updated.availability,
        skills: [...(updated.primarySkills || []), ...(updated.additionalSkills || [])],
      };
      const data = await apiClient.patch<any>(`/api/students/${profile.id}`, payload);
      if (data) {
        setProfile(mapStudentProfile(data));
      }
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(err?.message || "Failed to save profile changes.");
    }
  };

  const handleAddPortfolioProject = async (newProject: PortfolioProject) => {
    if (!profile) return;
    try {
      const payload = {
        title: newProject.title,
        description: newProject.description,
        tags: newProject.technologies || [],
        projectUrl: newProject.demoUrl || newProject.githubUrl,
      };
      await apiClient.post<any>(`/api/students/${profile.id}/portfolio`, payload);
      await loadProfile();
      setIsAddPortfolioOpen(false);
    } catch (err: any) {
      alert(err?.message || "Failed to add portfolio project.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl pb-12">
      {isLoading || isAuthLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-tertiary)]" />
          <p className="text-[14px] text-[var(--color-text-secondary)]">Loading student profile...</p>
        </div>
      ) : error || !profile ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-8 text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Unable to load profile
          </h3>
          <p className="text-[14px] text-[var(--color-text-secondary)] max-w-md">
            {error || "Student profile could not be found."}
          </p>
          <button
            type="button"
            onClick={() => loadProfile()}
            className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-5 text-[13px] font-medium text-white hover:bg-black transition-all"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Header & Stats */}
          <ProfileHeader
            profile={profile}
            onEdit={() => setIsEditModalOpen(true)}
            onShare={() => setIsShareModalOpen(true)}
          />
          <ProfileStats stats={profile.stats} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Column */}
            <div className="lg:col-span-2">
              <AboutSection
                about={profile.about}
                onEdit={() => setIsEditModalOpen(true)}
              />

              <PortfolioSection
                portfolio={profile.portfolio}
                onAddProject={() => setIsAddPortfolioOpen(true)}
              />

              <SkillBridgeProjects projects={completedProjects} />

              <ClientReviews reviews={reviews} />
            </div>

            {/* Right Sidebar Column */}
            <div className="flex flex-col">
              <ProfileVisibility
                isPublic={profile.isPublic}
                onToggle={handleToggleVisibility}
                isLoading={isVisibilitySaving}
              />
              <SkillProfile skillProfile={profile.skillProfile} />
              <SkillsSection profile={profile} />
              <ExperienceEducationSection profile={profile} />
            </div>
          </div>

          {/* Modals */}
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            profile={profile}
            onSave={handleSaveProfile}
          />

          <AddPortfolioModal
            isOpen={isAddPortfolioOpen}
            onClose={() => setIsAddPortfolioOpen(false)}
            onAdd={handleAddPortfolioProject}
          />

          <ShareProfileModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            username={profile.name}
            studentId={profile.id}
          />
        </>
      )}
    </div>
  );
}

export default function StudentProfilePage() {
  return (
    <StudentLayout title="Profile">
      <StudentProfileContent />
    </StudentLayout>
  );
}
