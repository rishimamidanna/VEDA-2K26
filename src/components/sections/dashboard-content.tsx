"use client";

import React from "react";
import { motion } from "framer-motion";

export const projects = [
  { title: "AI Chatbot Development", details: "₹8,000 • 2 weeks", match: 95, tags: ["Python", "LLM", "FastAPI"] },
  { title: "Mobile App UI/UX Design", details: "₹5,000 • 3 weeks", match: 92, tags: ["Figma", "UI/UX", "Prototyping"] },
  { title: "Data Analytics Dashboard", details: "₹7,500 • 3 weeks", match: 94, tags: ["Python", "SQL", "Power BI"] },
  { title: "E-commerce Landing Page", details: "₹6,000 • 2 weeks", match: 91, tags: ["React", "Tailwind", "Figma"] },
  { title: "Python Automation Tool", details: "₹4,500 • 1 week", match: 96, tags: ["Python", "APIs", "Automation"] },
  { title: "React Admin Dashboard", details: "₹9,000 • 3 weeks", match: 93, tags: ["React", "TypeScript", "Charts"] },
];

export function ProjectCard({ project }: { project: typeof projects[number] }) {
  return (
    <div className="rounded-lg border border-[#14141e]/[0.08] bg-white p-3 shadow-xs transition-colors hover:border-blue-200 hover:shadow-sm">
      <div className="flex items-start justify-between gap-1.5">
        <div>
          <h4 className="text-[12px] font-semibold text-[#1c1c1e]">
            {project.title}
          </h4>
          <p className="text-[10px] font-medium text-[#5c5c62]">
            {project.details}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50/90 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 border border-emerald-200/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {project.match}% Match
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {project.tags.map(tag => (
          <span key={tag} className="rounded-[4px] bg-[#f0f0f4] px-1.5 py-0.5 text-[9px] font-medium text-[#48484a] border border-[#14141e]/[0.04]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProjectFeed({ reduced }: { reduced: boolean }) {
  const firstTwo = projects.slice(0, 2).map(project => <ProjectCard key={project.title} project={project} />);
  if (reduced) return <div className="space-y-2">{firstTwo}</div>;

  return (
    <div className="relative flex-1 w-full overflow-hidden">
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 flex flex-col"
          initial={{ y: "0%" }}
          animate={{ y: "-50%" }}
          transition={{ duration: 24, ease: "linear", repeat: Infinity, repeatType: "loop" }}
        >
          {[0, 1].map(copy => (
            <div
              key={copy}
              className="space-y-3 pt-2 pb-2"
              aria-hidden={copy === 1 ? true : undefined}
            >
              {projects.map(project => <ProjectCard key={project.title} project={project} />)}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export function DashboardContent({ reduced = false }: { reduced?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col select-none overflow-hidden bg-white text-left font-sans antialiased">
      {/* Dashboard App Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#14141e]/[0.08] bg-[#f8f8fa] px-3.5">
        {/* Wordmark Mini */}
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          <span className="text-[12px] font-semibold tracking-tight text-[#1c1c1e]">
            SkillBridge
          </span>
        </div>

        {/* Greeting */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-[#636366]">
            Good morning,
          </span>
          <span className="text-[11px] font-semibold text-[#1c1c1e]">
            Alex
          </span>
        </div>

        {/* Status / Profile Avatar */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-300/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Verified
          </span>
          <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-[9px] font-semibold text-white flex items-center justify-center shadow-xs">
            A
          </div>
        </div>
      </div>

      {/* Dashboard Body Content */}
      <div className="flex flex-1 overflow-hidden bg-[#fafafc]">
        {/* Mini Left Sidebar */}
        <div className="flex w-14 shrink-0 flex-col items-center gap-3.5 border-r border-[#14141e]/[0.07] bg-[#f8f8fb] py-3.5 text-[#7c7c82]">
          <span className="rounded-md bg-[#14141e]/[0.07] p-1.5 text-[#1c1c1e] shadow-xs">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          </span>
          <span className="rounded-md p-1.5 hover:bg-black/[0.04] hover:text-[#1c1c1e] transition-colors">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span className="rounded-md p-1.5 hover:bg-black/[0.04] hover:text-[#1c1c1e] transition-colors">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span className="rounded-md p-1.5 hover:bg-black/[0.04] hover:text-[#1c1c1e] transition-colors">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
        </div>

        {/* Main Dashboard Panel */}
        <div className="flex flex-1 flex-col p-3.5 overflow-hidden">
          <div className="mb-2 flex shrink-0 items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-semibold text-[#1c1c1e]">
                Recommended for you
              </span>
              <span className="rounded-full bg-blue-50/90 px-1.5 py-0.5 text-[9px] font-semibold text-[#0066cc] border border-blue-200/80">
                Live
              </span>
            </div>
            <span className="text-[10px] font-medium text-[#68686e]">
              Updated 5m ago
            </span>
          </div>

          <ProjectFeed reduced={reduced} />
        </div>
      </div>
    </div>
  );
}
