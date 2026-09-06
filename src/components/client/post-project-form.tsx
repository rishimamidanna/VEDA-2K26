"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useClientAuth } from "./client-auth-context";
import { clientProjectsRepository, type ClientProjectItem } from "@/lib/client-projects-repository";

const CATEGORIES = [
  "Web Development",
  "Mobile App Development",
  "UI/UX & Product Design",
  "Brand Identity & Graphics",
  "AI & Machine Learning",
  "Content & Technical Writing",
  "Data Analysis & Scraping",
  "Marketing & SEO",
];

const SUGGESTED_SKILLS = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Python",
  "Figma",
  "UI/UX",
  "Node.js",
  "Flutter",
  "PostgreSQL",
  "SEO",
  "Copywriting",
];

const BUDGET_PRESETS = [
  { label: "₹3,000", value: "3000", hint: "Small task (1–3 days)" },
  { label: "₹5,000", value: "5000", hint: "Micro-project (3–7 days)" },
  { label: "₹10,000", value: "10000", hint: "Feature build (1–2 weeks)" },
  { label: "₹20,000", value: "20000", hint: "Full MVP (2–4 weeks)" },
];

const DURATION_OPTIONS = [
  "Less than 1 week",
  "1 to 2 weeks",
  "2 to 4 weeks",
  "1 to 2 months",
  "Flexible",
];

const EXPERIENCE_LEVELS = [
  {
    id: "entry",
    label: "Beginner / Fresher",
    description: "Motivated student eager to learn and build their first portfolio projects.",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "Has 1–2 production projects or proven domain coursework.",
  },
  {
    id: "advanced",
    label: "Advanced / Final Year",
    description: "Experienced builder with strong technical autonomy and past internships.",
  },
];

interface FormState {
  title: string;
  description: string;
  category: string;
  skills: string[];
  customSkillInput: string;
  budget: string;
  duration: string;
  experienceLevel: string;
  deliverables: string;
  deadline: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  skills?: string;
  budget?: string;
  duration?: string;
  experienceLevel?: string;
  deliverables?: string;
}

export function PostProjectForm() {
  const { user } = useClientAuth();

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "",
    skills: [],
    customSkillInput: "",
    budget: "",
    duration: "",
    experienceLevel: "",
    deliverables: "",
    deadline: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdProject, setCreatedProject] = useState<ClientProjectItem | null>(null);

  // Skill tag add/remove helpers
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!form.skills.includes(trimmed)) {
      setForm((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
        customSkillInput: "",
      }));
      if (errors.skills) {
        setErrors((prev) => ({ ...prev, skills: undefined }));
      }
    } else {
      setForm((prev) => ({ ...prev, customSkillInput: "" }));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Project title is required.";
    } else if (form.title.trim().length < 8) {
      newErrors.title = "Title should be at least 8 characters long.";
    }

    if (!form.description.trim()) {
      newErrors.description = "Project description is required.";
    } else if (form.description.trim().length < 30) {
      newErrors.description = "Provide at least 30 characters detailing the project.";
    }

    if (!form.category) {
      newErrors.category = "Please select a category.";
    }

    if (form.skills.length === 0) {
      newErrors.skills = "Please select or add at least one required skill tag.";
    }

    if (!form.budget.trim()) {
      newErrors.budget = "Please enter or select a project budget.";
    } else if (isNaN(Number(form.budget)) || Number(form.budget) <= 0) {
      newErrors.budget = "Budget must be a valid positive amount.";
    }

    if (!form.duration) {
      newErrors.duration = "Please select an estimated duration.";
    }

    if (!form.experienceLevel) {
      newErrors.experienceLevel = "Please choose a desired experience level.";
    }

    if (!form.deliverables.trim()) {
      newErrors.deliverables = "Specify key deliverables expected upon completion.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      // Scroll to the first error
      const firstErrorEl = document.querySelector("[aria-invalid='true']");
      firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    // Parse deliverables by newline or bullet points into clean string array
    const rawDeliverables = form.deliverables
      .split("\n")
      .map((d) => d.replace(/^[0-9]+[.)]\s*|^[-*•]\s*/, "").trim())
      .filter((d) => d.length > 0);

    const deliverablesList =
      rawDeliverables.length > 0 ? rawDeliverables : [form.deliverables.trim()];

    const experienceLabelMap: Record<string, string> = {
      entry: "Beginner / Fresher",
      intermediate: "Intermediate",
      advanced: "Advanced / Final Year",
    };

    const newProj = clientProjectsRepository.createProject({
      clientId: user?.id || "client-local",
      title: form.title,
      description: form.description,
      category: form.category,
      skills: form.skills,
      budget: form.budget,
      duration: form.duration,
      experienceLevel: experienceLabelMap[form.experienceLevel] || form.experienceLevel,
      deliverables: deliverablesList,
      deadline: form.deadline || undefined,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setCreatedProject(newProj);
      setSubmitSuccess(true);
    }, 400);
  };

  if (submitSuccess && createdProject) {
    return (
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-8 sm:p-12 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Project Posted Successfully!
        </h2>
        <p className="mt-2 max-w-md mx-auto text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
          &ldquo;{createdProject.title}&rdquo; is now live on your client workspace under status <span className="font-semibold text-emerald-700">Open</span> with budget <span className="font-semibold text-[var(--color-text-primary)]">{createdProject.budget}</span>.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/client/projects"
            className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-6 text-[14px] font-medium text-white shadow-xs transition-colors hover:bg-black"
          >
            View in My Projects
          </Link>
          <button
            type="button"
            onClick={() => {
              setForm({
                title: "",
                description: "",
                category: "",
                skills: [],
                customSkillInput: "",
                budget: "",
                duration: "",
                experienceLevel: "",
                deliverables: "",
                deadline: "",
              });
              setCreatedProject(null);
              setSubmitSuccess(false);
            }}
            className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-6 text-[14px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)]"
          >
            Post Another Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-8 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-6 sm:p-8 lg:p-10 shadow-2xs"
    >
      {/* 1. Project Title */}
      <div className="space-y-2">
        <label
          htmlFor="project-title"
          className="block text-[14px] font-semibold text-[var(--color-text-primary)]"
        >
          Project Title <span className="text-red-500">*</span>
        </label>
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Write a concise title that clearly describes what you need built.
        </p>
        <input
          id="project-title"
          type="text"
          value={form.title}
          onChange={(e) => {
            setForm({ ...form, title: e.target.value });
            if (errors.title) setErrors({ ...errors, title: undefined });
          }}
          placeholder="e.g. Build Next.js Landing Page with Tailwind CSS"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          className={cn(
            "w-full rounded-xl border bg-[var(--color-canvas-bg)] px-4 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all",
            errors.title
              ? "border-red-500 ring-1 ring-red-500/20"
              : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)]"
          )}
        />
        {errors.title && (
          <p id="title-error" className="text-[12px] font-medium text-red-600">
            {errors.title}
          </p>
        )}
      </div>

      {/* 2. Description */}
      <div className="space-y-2">
        <label
          htmlFor="project-description"
          className="block text-[14px] font-semibold text-[var(--color-text-primary)]"
        >
          Project Description <span className="text-red-500">*</span>
        </label>
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Explain your project goals, scope, and what success looks like for the student.
        </p>
        <textarea
          id="project-description"
          rows={5}
          value={form.description}
          onChange={(e) => {
            setForm({ ...form, description: e.target.value });
            if (errors.description) setErrors({ ...errors, description: undefined });
          }}
          placeholder="Provide context, references, existing repositories, or specific guidelines..."
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "desc-error" : undefined}
          className={cn(
            "w-full rounded-xl border bg-[var(--color-canvas-bg)] px-4 py-3 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all resize-y",
            errors.description
              ? "border-red-500 ring-1 ring-red-500/20"
              : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)]"
          )}
        />
        {errors.description && (
          <p id="desc-error" className="text-[12px] font-medium text-red-600">
            {errors.description}
          </p>
        )}
      </div>

      {/* 3. Category & Estimated Duration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Category */}
        <div className="space-y-2">
          <label
            htmlFor="project-category"
            className="block text-[14px] font-semibold text-[var(--color-text-primary)]"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="project-category"
            value={form.category}
            onChange={(e) => {
              setForm({ ...form, category: e.target.value });
              if (errors.category) setErrors({ ...errors, category: undefined });
            }}
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? "cat-error" : undefined}
            className={cn(
              "w-full rounded-xl border bg-[var(--color-canvas-bg)] px-4 py-2.5 text-[14px] text-[var(--color-text-primary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all",
              errors.category
                ? "border-red-500 ring-1 ring-red-500/20"
                : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)]"
            )}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p id="cat-error" className="text-[12px] font-medium text-red-600">
              {errors.category}
            </p>
          )}
        </div>

        {/* Estimated Duration */}
        <div className="space-y-2">
          <label
            htmlFor="project-duration"
            className="block text-[14px] font-semibold text-[var(--color-text-primary)]"
          >
            Estimated Duration <span className="text-red-500">*</span>
          </label>
          <select
            id="project-duration"
            value={form.duration}
            onChange={(e) => {
              setForm({ ...form, duration: e.target.value });
              if (errors.duration) setErrors({ ...errors, duration: undefined });
            }}
            aria-invalid={!!errors.duration}
            aria-describedby={errors.duration ? "dur-error" : undefined}
            className={cn(
              "w-full rounded-xl border bg-[var(--color-canvas-bg)] px-4 py-2.5 text-[14px] text-[var(--color-text-primary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all",
              errors.duration
                ? "border-red-500 ring-1 ring-red-500/20"
                : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)]"
            )}
          >
            <option value="">Select expected turnaround</option>
            {DURATION_OPTIONS.map((dur) => (
              <option key={dur} value={dur}>
                {dur}
              </option>
            ))}
          </select>
          {errors.duration && (
            <p id="dur-error" className="text-[12px] font-medium text-red-600">
              {errors.duration}
            </p>
          )}
        </div>
      </div>

      {/* 4. Required Skills Multi-tag */}
      <div className="space-y-2">
        <label
          htmlFor="skill-input"
          className="block text-[14px] font-semibold text-[var(--color-text-primary)]"
        >
          Required Skills <span className="text-red-500">*</span>
        </label>
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Select from popular student skills or type and press enter to add custom tags.
        </p>

        {/* Selected skill badges */}
        {form.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 pb-2">
            {form.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-text-primary)] text-white px-3 py-1 text-[12px] font-medium shadow-2xs"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  aria-label={`Remove skill ${skill}`}
                  className="rounded hover:bg-white/20 p-0.5 focus-visible:outline-hidden"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Custom skill input */}
        <div className="flex gap-2">
          <input
            id="skill-input"
            type="text"
            value={form.customSkillInput}
            onChange={(e) => setForm({ ...form, customSkillInput: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill(form.customSkillInput);
              }
            }}
            placeholder="Type a skill and press Enter..."
            className="flex-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-4 py-2 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          />
          <button
            type="button"
            onClick={() => handleAddSkill(form.customSkillInput)}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-white px-4 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)]"
          >
            Add
          </button>
        </div>

        {/* Suggested Skills Pill Pool */}
        <div className="pt-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Suggested:
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {SUGGESTED_SKILLS.map((skill) => {
              const isSelected = form.skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      handleRemoveSkill(skill);
                    } else {
                      handleAddSkill(skill);
                    }
                  }}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
                    isSelected
                      ? "bg-[var(--color-text-primary)] text-white"
                      : "bg-[var(--color-canvas-surface)] text-[var(--color-text-secondary)] hover:bg-black/5 hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                </button>
              );
            })}
          </div>
        </div>

        {errors.skills && (
          <p className="text-[12px] font-medium text-red-600 pt-1">
            {errors.skills}
          </p>
        )}
      </div>

      {/* 5. Budget (Realistic student micro-project presets + custom amount) */}
      <div className="space-y-3">
        <label
          htmlFor="project-budget"
          className="block text-[14px] font-semibold text-[var(--color-text-primary)]"
        >
          Project Budget (INR ₹) <span className="text-red-500">*</span>
        </label>
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Fair, milestone-based compensation designed for student micro-projects.
        </p>

        {/* Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BUDGET_PRESETS.map((preset) => {
            const isSelected = form.budget === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  setForm({ ...form, budget: preset.value });
                  if (errors.budget) setErrors({ ...errors, budget: undefined });
                }}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-3 text-left transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
                  isSelected
                    ? "border-[var(--color-text-primary)] bg-[var(--color-canvas-surface)] ring-1 ring-[var(--color-text-primary)]"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] hover:border-[var(--color-border-hover)]"
                )}
              >
                <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                  {preset.label}
                </span>
                <span className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
                  {preset.hint}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <div className="relative mt-2">
          <span className="absolute left-4 top-2.5 text-[14px] font-medium text-[var(--color-text-tertiary)]">
            ₹
          </span>
          <input
            id="project-budget"
            type="number"
            min="500"
            step="500"
            value={form.budget}
            onChange={(e) => {
              setForm({ ...form, budget: e.target.value });
              if (errors.budget) setErrors({ ...errors, budget: undefined });
            }}
            placeholder="Or enter custom amount in ₹"
            aria-invalid={!!errors.budget}
            aria-describedby={errors.budget ? "budget-error" : undefined}
            className={cn(
              "w-full rounded-xl border bg-[var(--color-canvas-bg)] pl-8 pr-4 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
              errors.budget
                ? "border-red-500 ring-1 ring-red-500/20"
                : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)]"
            )}
          />
        </div>
        {errors.budget && (
          <p id="budget-error" className="text-[12px] font-medium text-red-600">
            {errors.budget}
          </p>
        )}
      </div>

      {/* 6. Experience Level */}
      <div className="space-y-3">
        <label className="block text-[14px] font-semibold text-[var(--color-text-primary)]">
          Target Student Experience Level <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {EXPERIENCE_LEVELS.map((level) => {
            const isSelected = form.experienceLevel === level.id;
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => {
                  setForm({ ...form, experienceLevel: level.id });
                  if (errors.experienceLevel) setErrors({ ...errors, experienceLevel: undefined });
                }}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-4 text-left transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
                  isSelected
                    ? "border-[var(--color-text-primary)] bg-[var(--color-canvas-surface)] ring-1 ring-[var(--color-text-primary)]"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] hover:border-[var(--color-border-hover)]"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      isSelected
                        ? "border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-white"
                        : "border-[var(--color-border-hover)]"
                    )}
                  >
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-[13px] sm:text-[14px] font-semibold text-[var(--color-text-primary)]">
                    {level.label}
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-[var(--color-text-secondary)] leading-normal">
                  {level.description}
                </p>
              </button>
            );
          })}
        </div>
        {errors.experienceLevel && (
          <p className="text-[12px] font-medium text-red-600">
            {errors.experienceLevel}
          </p>
        )}
      </div>

      {/* 7. Key Deliverables */}
      <div className="space-y-2">
        <label
          htmlFor="project-deliverables"
          className="block text-[14px] font-semibold text-[var(--color-text-primary)]"
        >
          Expected Deliverables <span className="text-red-500">*</span>
        </label>
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          List specific assets or code artifacts (e.g., GitHub repository, Figma file, Vercel deployment).
        </p>
        <textarea
          id="project-deliverables"
          rows={3}
          value={form.deliverables}
          onChange={(e) => {
            setForm({ ...form, deliverables: e.target.value });
            if (errors.deliverables) setErrors({ ...errors, deliverables: undefined });
          }}
          placeholder="1. GitHub repository with clean Next.js code&#10;2. Responsive layout for mobile and desktop&#10;3. Brief README setup guide"
          aria-invalid={!!errors.deliverables}
          aria-describedby={errors.deliverables ? "deliv-error" : undefined}
          className={cn(
            "w-full rounded-xl border bg-[var(--color-canvas-bg)] px-4 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all resize-y",
            errors.deliverables
              ? "border-red-500 ring-1 ring-red-500/20"
              : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-hover)]"
          )}
        />
        {errors.deliverables && (
          <p id="deliv-error" className="text-[12px] font-medium text-red-600">
            {errors.deliverables}
          </p>
        )}
      </div>

      {/* 8. Optional Deadline */}
      <div className="space-y-2">
        <label
          htmlFor="project-deadline"
          className="block text-[14px] font-semibold text-[var(--color-text-primary)]"
        >
          Target Deadline <span className="text-[12px] font-normal text-[var(--color-text-tertiary)]">(Optional)</span>
        </label>
        <input
          id="project-deadline"
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          className="w-full sm:w-64 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-4 py-2.5 text-[14px] text-[var(--color-text-primary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        />
      </div>

      {/* Action Footer: Cancel and Post Project */}
      <div className="pt-6 border-t border-[var(--color-border-subtle)] flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
        <Link
          href="/client/dashboard"
          className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white px-6 text-[14px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] hover:border-[var(--color-border-hover)] active:scale-[0.98] transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-text-primary)] px-7 text-[14px] font-medium text-white shadow-xs transition-all hover:bg-black hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          {isSubmitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Posting...</span>
            </>
          ) : (
            <span>Post Project</span>
          )}
        </button>
      </div>
    </form>
  );
}
