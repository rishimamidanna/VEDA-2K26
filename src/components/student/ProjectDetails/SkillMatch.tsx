"use client";

import { Check, X } from "lucide-react";
import type { Project } from "@/types";

export function SkillMatch({ project }: { project: Project }) {
  // Mock logic to determine matched vs missing skills
  // In a real app, this would compare project.skills against student.skills
  const allSkills = project.skills;
  const matchCount = Math.ceil(allSkills.length * (project.matchPercentage / 100));
  const matchedSkills = allSkills.slice(0, matchCount);
  const gapSkills = allSkills.slice(matchCount);

  // If there are no gap skills and it's a high match, maybe invent a random missing skill
  // just to show the UI, or just show all matched. Let's just show all matched.
  if (gapSkills.length === 0 && project.matchPercentage < 100) {
    gapSkills.push("UI Design"); // arbitrary mock gap
  }

  const isHighMatch = project.matchPercentage >= 85;

  return (
    <div className="mb-10 overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-white">
      <div className={`border-b border-[var(--color-border-subtle)] p-6 ${isHighMatch ? 'bg-emerald-50/50' : 'bg-blue-50/50'}`}>
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-bold ${isHighMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
            {project.matchPercentage}%
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Skill Match
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {isHighMatch
                ? "Your skills are a strong fit for this project."
                : "You have most of the required skills for this project."}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {matchedSkills.length > 0 && (
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Matched Skills
              </h4>
              <ul className="flex flex-col gap-2">
                {matchedSkills.map((skill) => (
                  <li key={skill} className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check size={12} />
                    </div>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {gapSkills.length > 0 && (
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Potential Skill Gaps
              </h4>
              <ul className="flex flex-col gap-2">
                {gapSkills.map((skill) => (
                  <li key={skill} className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <X size={12} />
                    </div>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
