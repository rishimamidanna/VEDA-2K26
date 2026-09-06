"use client";

import { motion } from "framer-motion";
import { Edit2, Eye, EyeOff } from "lucide-react";
import type { StudentProfile } from "@/types";

export function AboutSection({ about, onEdit }: { about: string; onEdit: () => void }) {
  return (
    <div className="mb-8 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">About Me</h2>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Edit2 size={14} />
          Edit
        </button>
      </div>
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap">
        {about}
      </p>
    </div>
  );
}

export function SkillsSection({ profile }: { profile: StudentProfile }) {
  return (
    <div className="mb-8 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-bold text-[var(--color-text-primary)]">Skills</h2>
      
      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Primary Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.primarySkills.map((skill) => (
            <span key={skill} className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-1.5 text-sm font-semibold text-blue-700">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Additional
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.additionalSkills.map((skill) => (
            <span key={skill} className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)]">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkillProfile({ skillProfile }: { skillProfile: StudentProfile["skillProfile"] }) {
  return (
    <div className="mb-8 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">Your Skill Profile</h2>
      <p className="mb-6 text-xs text-[var(--color-text-secondary)]">
        These skill areas are used to recommend relevant projects.
      </p>
      
      <div className="flex flex-col gap-4">
        {skillProfile.map((skill, index) => (
          <div key={skill.category}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--color-text-primary)]">{skill.category}</span>
              <span className="font-semibold text-blue-600">{skill.score}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.score}%` }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExperienceEducationSection({ profile }: { profile: StudentProfile }) {
  return (
    <div className="mb-8 flex flex-col gap-8">
      {/* Experience */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-[var(--color-text-primary)]">Experience</h2>
        <div className="flex flex-col gap-6">
          {profile.experience.map((exp, index) => (
            <div key={exp.id} className="relative pl-4">
              <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
              {index < profile.experience.length - 1 && (
                <div className="absolute left-[3px] top-4 h-full w-px bg-[var(--color-border-subtle)]" />
              )}
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{exp.role}</h3>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">{exp.company} • {exp.duration}</p>
              <p className="mt-2 text-sm text-[var(--color-text-primary)]">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-[var(--color-text-primary)]">Education</h2>
        <div className="flex flex-col gap-6">
          {profile.education.map((edu, index) => (
            <div key={edu.id} className="relative pl-4">
              <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-indigo-500" />
              {index < profile.education.length - 1 && (
                <div className="absolute left-[3px] top-4 h-full w-px bg-[var(--color-border-subtle)]" />
              )}
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{edu.degree}</h3>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">{edu.institution}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{edu.duration}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileVisibility({ isPublic, onToggle }: { isPublic: boolean; onToggle: () => void }) {
  return (
    <div className="mb-8 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            {isPublic ? <Eye size={18} className="text-blue-600" /> : <EyeOff size={18} className="text-gray-400" />}
            Profile Visibility
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {isPublic ? "Clients can discover your profile." : "Your profile is hidden from clients."}
          </p>
        </div>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPublic ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPublic ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
