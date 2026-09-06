"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { studentTalentRepository } from "@/lib/student-talent-repository";

const EXPERTISE_OPTIONS = [
  "All Categories",
  "Web Development",
  "UI/UX & Design",
  "AI & Data",
  "Content & Writing",
];

const EXPERIENCE_OPTIONS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const AVAILABILITY_OPTIONS = [
  "All Availabilities",
  "Available Now",
  "10-20 hrs/week",
  "Part-time",
  "Project-based",
];

const POPULAR_SKILLS = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Figma",
  "UI/UX",
  "Python",
  "Node.js",
  "SEO",
];

export function TalentDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("All Categories");
  const [selectedExperience, setSelectedExperience] = useState("All Levels");
  const [selectedAvailability, setSelectedAvailability] = useState("All Availabilities");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Filter and Search Logic via repository
  const filteredTalent = useMemo(() => {
    return studentTalentRepository.filterStudents({
      searchQuery,
      expertise: selectedExpertise,
      experience: selectedExperience,
      availability: selectedAvailability,
      skill: selectedSkill || undefined,
    });
  }, [
    searchQuery,
    selectedExpertise,
    selectedExperience,
    selectedAvailability,
    selectedSkill,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedExpertise("All Categories");
    setSelectedExperience("All Levels");
    setSelectedAvailability("All Availabilities");
    setSelectedSkill(null);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedExpertise !== "All Categories" ||
    selectedExperience !== "All Levels" ||
    selectedAvailability !== "All Availabilities" ||
    selectedSkill !== null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              Find Talent
            </h1>
            <span className="inline-flex items-center rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#0071e3]">
              Demo Profiles
            </span>
          </div>
          <p className="mt-1 text-[14px] sm:text-[15px] text-[var(--color-text-secondary)]">
            Explore verified student builders, designers, and writers ready to collaborate.
          </p>
        </div>

        <Link
          href="/client/projects/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--color-text-primary)] px-5 text-[13px] sm:text-[14px] font-medium text-white shadow-xs transition-all hover:bg-black hover:shadow-sm active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] shrink-0 self-start sm:self-auto"
        >
          <span className="text-[16px] leading-none font-light">+</span>
          <span>Post a Project</span>
        </Link>
      </div>

      {/* Search & Filter Controls Card */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 sm:p-6 shadow-2xs space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--color-text-tertiary)]">
            <svg
              className="h-4.5 w-4.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name, skills, headline, or university..."
            className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] pl-11 pr-4 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-3 flex items-center px-2 text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Category / Expertise */}
          <div>
            <label
              htmlFor="expertise-filter"
              className="block text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1"
            >
              Expertise
            </label>
            <select
              id="expertise-filter"
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              {EXPERTISE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label
              htmlFor="experience-filter"
              className="block text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1"
            >
              Experience
            </label>
            <select
              id="experience-filter"
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div>
            <label
              htmlFor="availability-filter"
              className="block text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1"
            >
              Availability
            </label>
            <select
              id="availability-filter"
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skills Tag Pills */}
        <div className="pt-2 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Filter by Skills
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[12px] font-medium text-[#0071e3] hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SKILLS.map((skill) => {
              const isSelected = selectedSkill === skill;
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSelectedSkill(isSelected ? null : skill)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[12px] font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
                    isSelected
                      ? "bg-[var(--color-text-primary)] text-white shadow-xs font-semibold"
                      : "bg-[var(--color-canvas-surface)] text-[var(--color-text-secondary)] hover:bg-black/5 hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-[13px] text-[var(--color-text-secondary)] px-1">
        <span>
          Showing <span className="font-semibold text-[var(--color-text-primary)]">{filteredTalent.length}</span> verified student {filteredTalent.length === 1 ? "profile" : "profiles"}
        </span>
        <span className="text-[12px] text-[var(--color-text-tertiary)]">
          Zero fake metrics &bull; Real verified coursework &amp; portfolio links
        </span>
      </div>

      {/* Talent Cards Grid or Empty State */}
      {filteredTalent.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-8 sm:p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-canvas-surface)] text-[var(--color-text-tertiary)]">
            <svg
              className="h-6 w-6"
              aria-hidden={true}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h3 className="text-[15px] sm:text-[16px] font-semibold text-[var(--color-text-primary)]">
            No matching students found
          </h3>
          <p className="mt-1.5 max-w-sm text-[13px] sm:text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
            Try loosening your filters or searching for other skills.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 inline-flex h-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-5 text-[13px] font-medium text-[var(--color-text-primary)] shadow-2xs hover:bg-[var(--color-canvas-surface)]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTalent.map((student) => (
            <div
              key={student.id}
              className="flex flex-col justify-between rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-5 sm:p-6 shadow-2xs transition-all hover:border-[var(--color-border-hover)] hover:shadow-xs space-y-4"
            >
              <div className="space-y-3.5">
                {/* Top: Avatar, Name, College, Availability */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3]/15 via-[#5a6ef5]/20 to-[#9c71f7]/25 text-[#0071e3] font-bold text-[14px] shadow-2xs">
                      {student.avatarInitials}
                    </div>
                    <div>
                      <h2 className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
                        {student.name}
                      </h2>
                      <p className="text-[13px] font-medium text-[var(--color-text-secondary)] line-clamp-1">
                        {student.headline}
                      </p>
                      <p
                        className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 line-clamp-1"
                        dangerouslySetInnerHTML={{ __html: student.college }}
                      />
                    </div>
                  </div>

                  <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 shrink-0">
                    {student.availability}
                  </span>
                </div>

                {/* Experience Tier & Expertise Category */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded-lg bg-[var(--color-canvas-surface)] border border-[var(--color-border-subtle)] px-2 py-0.5 font-medium text-[var(--color-text-secondary)]">
                    {student.expertise}
                  </span>
                  <span className="rounded-lg bg-[var(--color-canvas-surface)] border border-[var(--color-border-subtle)] px-2 py-0.5 font-medium text-[var(--color-text-secondary)]">
                    {student.experience} Level
                  </span>
                </div>

                {/* Portfolio Summary Preview */}
                <div className="rounded-xl bg-[var(--color-canvas-surface)] p-3.5 text-[12px] sm:text-[13px] text-[var(--color-text-secondary)] leading-relaxed border border-[var(--color-border-subtle)] line-clamp-2">
                  <span className="font-semibold text-[var(--color-text-primary)]">Portfolio: </span>
                  {student.portfolioSummary}
                </div>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {student.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: View Profile CTA */}
              <div className="pt-3.5 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  Active demo profile
                </span>

                <Link
                  href={`/client/talent/${student.id}`}
                  className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-4 text-[12px] font-medium text-[var(--color-text-primary)] shadow-2xs hover:bg-[var(--color-canvas-surface)] hover:border-[var(--color-border-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
