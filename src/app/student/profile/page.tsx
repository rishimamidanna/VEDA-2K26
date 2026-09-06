"use client";

import { useState } from "react";
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
import { initialProfileData } from "@/data/profile";
import { getAllWorkProjects } from "@/data/work";
import type { PortfolioProject } from "@/types";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(initialProfileData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Get completed SkillBridge projects and mock reviews from the work data
  const completedProjects = getAllWorkProjects().filter((w) => w.status === "Completed");
  
  // Extract mock reviews
  const reviews = completedProjects
    .filter((w) => w.review && w.rating)
    .map((w) => ({
      id: w.id,
      rating: w.rating!,
      review: w.review!,
      client: w.project.client,
    }));

  const handleAddPortfolioProject = (newProject: PortfolioProject) => {
    setProfile({
      ...profile,
      portfolio: [newProject, ...profile.portfolio],
    });
  };

  return (
    <StudentLayout title="Profile">
      <div className="mx-auto max-w-5xl pb-12">
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
              onToggle={() => setProfile({ ...profile, isPublic: !profile.isPublic })}
            />
            <SkillProfile skillProfile={profile.skillProfile} />
            <SkillsSection profile={profile} />
            <ExperienceEducationSection profile={profile} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={(updated) => setProfile(updated)}
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
      />
    </StudentLayout>
  );
}
