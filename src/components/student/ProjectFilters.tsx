"use client";

import { Filter } from "lucide-react";
import { FILTER_OPTIONS } from "@/data/projects";
import type { ProjectFilters as FiltersType, ProjectCategory } from "@/types";

interface ProjectFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
  onClear: () => void;
  className?: string;
}

export function ProjectFilters({ filters, onChange, onClear, className }: ProjectFiltersProps) {
  const handleCategoryChange = (category: string) => {
    onChange({
      ...filters,
      category: filters.category === category ? null : (category as ProjectCategory),
    });
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    onChange({ ...filters, skills: newSkills });
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
          <Filter size={16} />
          Filters
        </h3>
        <button
          onClick={onClear}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Category */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Category
        </h4>
        <div className="flex flex-col gap-2">
          {FILTER_OPTIONS.categories.map((cat) => (
            <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text-primary)] hover:text-blue-600 transition-colors">
              <input
                type="radio"
                checked={filters.category === cat}
                onChange={() => handleCategoryChange(cat)}
                className="h-4 w-4 rounded-full border-[var(--color-border-subtle)] text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.skills.map((skill) => {
            const isSelected = filters.skills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Budget
        </h4>
        <div className="flex flex-col gap-2">
          {FILTER_OPTIONS.budgetRanges.map((budget) => (
            <label key={budget} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text-primary)] hover:text-blue-600 transition-colors">
              <input
                type="radio"
                checked={filters.budgetRange === budget}
                onChange={() =>
                  onChange({
                    ...filters,
                    budgetRange: filters.budgetRange === budget ? null : budget,
                  })
                }
                className="h-4 w-4 rounded-full border-[var(--color-border-subtle)] text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              {budget}
            </label>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Duration
        </h4>
        <div className="flex flex-col gap-2">
          {FILTER_OPTIONS.durations.map((duration) => (
            <label key={duration} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text-primary)] hover:text-blue-600 transition-colors">
              <input
                type="radio"
                checked={filters.duration === duration}
                onChange={() =>
                  onChange({
                    ...filters,
                    duration: filters.duration === duration ? null : duration,
                  })
                }
                className="h-4 w-4 rounded-full border-[var(--color-border-subtle)] text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              {duration}
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Experience Level
        </h4>
        <div className="flex flex-col gap-2">
          {FILTER_OPTIONS.experienceLevels.map((level) => (
            <label key={level} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text-primary)] hover:text-blue-600 transition-colors">
              <input
                type="radio"
                checked={filters.experienceLevel === level}
                onChange={() =>
                  onChange({
                    ...filters,
                    experienceLevel: filters.experienceLevel === level ? null : level,
                  })
                }
                className="h-4 w-4 rounded-full border-[var(--color-border-subtle)] text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              {level}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
