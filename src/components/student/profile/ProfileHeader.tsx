"use client";

import { motion } from "framer-motion";
import { Edit2, Share, MapPin, Briefcase, GraduationCap, Calendar } from "lucide-react";
import type { StudentProfile } from "@/types";

interface ProfileHeaderProps {
  profile: StudentProfile;
  onEdit: () => void;
  onShare: () => void;
}

export function ProfileHeader({ profile, onEdit, onShare }: ProfileHeaderProps) {
  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-white shadow-sm"
      >
        {/* Banner */}
        <div className="h-32 w-full bg-gradient-to-r from-blue-600 to-indigo-600 sm:h-40" />

        <div className="relative px-6 pb-8 pt-4 sm:px-8">
          {/* Avatar & Actions Row */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between">
            {/* Avatar */}
            <div className="-mt-16 sm:-mt-20 flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-2xl border-4 border-white bg-[var(--color-canvas-surface)] shadow-sm">
              <span className="text-3xl sm:text-5xl font-bold text-blue-600">
                {profile.name.charAt(0)}
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-4 flex items-center gap-3 sm:mt-0">
              <button
                onClick={onShare}
                className="flex items-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
              >
                <Share size={16} />
                Share Profile
              </button>
              <button
                onClick={onEdit}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
              {profile.name}
            </h1>
            <p className="mt-1 text-lg font-medium text-[var(--color-text-primary)]">
              {profile.headline}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 border-t border-[var(--color-border-subtle)] pt-6">
            <div className="flex flex-col gap-3 text-sm text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                {profile.location}
              </span>
              <span className="flex items-center gap-2">
                <Briefcase size={16} className="text-gray-400" />
                {profile.availability}
              </span>
            </div>
            
            <div className="flex flex-col gap-3 text-sm text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-2">
                <GraduationCap size={16} className="text-gray-400" />
                B.Tech Computer Science (Mock)
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                Expected Graduation: 2028 (Mock)
              </span>
            </div>
          </div>

          {/* Profile Strength */}
          <div className="mt-8 rounded-xl bg-[var(--color-canvas-surface)] p-4 border border-[var(--color-border-subtle)]">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-[var(--color-text-primary)]">Profile Strength</span>
              <span className="font-bold text-blue-600">{profile.completionPercentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile.completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
              />
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              Complete your profile to improve your project matches.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ProfileStats({ stats }: { stats: StudentProfile["stats"] }) {
  const statItems = [
    { label: "Projects Completed", value: stats.projectsCompleted, color: "text-emerald-600" },
    { label: "Projects In Progress", value: stats.projectsInProgress, color: "text-blue-600" },
    { label: "Client Rating", value: `${stats.clientRating} ★`, color: "text-yellow-600" },
    { label: "Profile Views", value: stats.profileViews, color: "text-purple-600" },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {statItems.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 + 0.2, ease: "easeOut" }}
          className="flex flex-col gap-1 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-5 shadow-sm"
        >
          <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
