"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock, IndianRupee, X } from "lucide-react";
import { allProjects } from "@/data/projects";
import { allWorkProjects } from "@/data/work";
import type { Conversation } from "@/types";
import { WorkProjectProgress } from "@/components/student/work";

interface ProjectContextProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectContext({ conversation, isOpen, onClose }: ProjectContextProps) {
  const project = allProjects.find((p) => p.id === conversation.projectId);
  const work = allWorkProjects.find((w) => w.projectId === conversation.projectId);

  if (!project) return null;

  const content = (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-4 flex-shrink-0">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Project Details</h3>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-[var(--color-text-secondary)] hover:bg-gray-100 transition-colors xl:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-6 p-5">
        {/* Project Summary */}
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Project</p>
          <h4 className="text-base font-bold text-[var(--color-text-primary)] leading-snug">
            {project.title}
          </h4>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Client: <span className="font-semibold text-[var(--color-text-primary)]">{project.client}</span>
          </p>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee size={14} className="text-gray-400" />
            <span className="font-semibold text-[var(--color-text-primary)]">{project.budget}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-gray-400" />
            <span className="text-[var(--color-text-secondary)]">
              Deadline: <span className="font-medium text-[var(--color-text-primary)]">{project.deadline || "TBD"}</span>
            </span>
          </div>
        </div>

        {/* Status / Progress */}
        {work && (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text-primary)]">Status</span>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                work.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-100"
                : work.status === "Awaiting Review" ? "bg-purple-50 text-purple-700 border-purple-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-100"
              }`}>
                {work.status}
              </span>
            </div>
            <WorkProjectProgress progress={work.progress} />
          </div>
        )}

        {/* Project Context */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Project Context</p>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Skills */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {project.skills.map((skill) => (
              <span key={skill} className="rounded-md bg-[var(--color-canvas-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        {work && (
          <Link
            href={`/student/work/${work.id}`}
            className="group flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            View Project Workspace
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
        {!work && (
          <Link
            href={`/student/projects/${project.id}`}
            className="group flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border-subtle)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
          >
            View Project
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent panel */}
      <div className="hidden xl:flex xl:w-72 xl:flex-shrink-0 xl:flex-col border-l border-[var(--color-border-subtle)]">
        {content}
      </div>

      {/* Mobile / tablet slide-over */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 xl:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-80 shadow-2xl max-w-full"
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
