"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, useSpring, useInView, useTransform } from "framer-motion";
import { FloatingCard, useDesktopMotion, useIdlePhase } from "./hero-motion";

const projects = [
  { title: "AI Chatbot Development", details: "₹8,000 • 2 weeks", match: 95, tags: ["Python", "LLM", "FastAPI"] },
  { title: "Mobile App UI/UX Design", details: "₹5,000 • 3 weeks", match: 92, tags: ["Figma", "UI/UX", "Prototyping"] },
  { title: "Data Analytics Dashboard", details: "₹7,500 • 3 weeks", match: 94, tags: ["Python", "SQL", "Power BI"] },
  { title: "E-commerce Landing Page", details: "₹6,000 • 2 weeks", match: 91, tags: ["React", "Tailwind", "Figma"] },
  { title: "Python Automation Tool", details: "₹4,500 • 1 week", match: 96, tags: ["Python", "APIs", "Automation"] },
  { title: "React Admin Dashboard", details: "₹9,000 • 3 weeks", match: 93, tags: ["React", "TypeScript", "Charts"] },
];

function ProjectCard({ project }: { project: typeof projects[number] }) {
  return (
    <div className="rounded-lg sm:rounded-xl border border-[var(--color-border-subtle)] bg-white p-2 sm:p-2.5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-1.5">
        <div>
          <h4 className="text-[11px] sm:text-[12px] font-semibold text-[var(--color-text-primary)]">
            {project.title}
          </h4>
          <p className="text-[9px] sm:text-[10px] font-medium text-[var(--color-text-secondary)]">
            {project.details}
          </p>
        </div>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 border border-emerald-200">
          <span className="h-1 w-1 rounded-full bg-emerald-500" />
          {project.match}% Match
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {project.tags.map(tag => (
          <span key={tag} className="rounded-sm bg-[#f5f5f7] px-1.5 py-0.2 text-[8px] sm:text-[9px] font-medium text-[var(--color-text-secondary)]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProjectFeed({ reduced }: { reduced: boolean }) {
  const firstTwo = projects.slice(0, 2).map(project => <ProjectCard key={project.title} project={project} />);
  if (reduced) return <div className="space-y-2">{firstTwo}</div>;

  return (
    <div className="relative overflow-hidden">
      {/* Preserve exactly the original two-card height at every breakpoint. */}
      <div className="invisible space-y-2" aria-hidden="true">{firstTwo}</div>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)",
        }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 flex flex-col"
          initial={{ y: "0%" }}
          animate={{ y: "-50%" }}
          transition={{ duration: 22, ease: "linear", repeat: Infinity, repeatType: "loop" }}
        >
          {/* Matching padded groups make the -50% seam an identical frame. */}
          {[0, 1].map(copy => (
            <div
              key={copy}
              className="space-y-3 pt-3 pb-3 sm:space-y-4 sm:pt-3 sm:pb-4"
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

export function HeroVisual() {
  const reduced = useReducedMotion();
  const desktop = useDesktopMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const rotateX = useSpring(0, { stiffness: 90, damping: 24 });
  const rotateY = useSpring(0, { stiffness: 90, damping: 24 });
  const breathing = useIdlePhase(visible && !reduced, 16, 1.2);
  const laptopY = useTransform(breathing, value => value * 2);
  const reset = () => { rotateX.set(0); rotateY.set(0); };
  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={(event) => {
        if (!desktop || reduced || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
        rotateX.set(-y * 2.5);
        rotateY.set(x * 4);
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
      className="relative mx-auto w-full max-w-[560px] [perspective:1400px]">
      {/* Perspective belongs to the stationary parent; rotate its 3D scene.
          Pointer coordinates also use that parent to avoid a moving hit area. */}
      <motion.div
        style={{ rotateX: desktop && !reduced ? rotateX : 0, rotateY: desktop && !reduced ? rotateY : 0 }}
        className="relative w-full [transform-style:preserve-3d]">
      {/* Retain the original local perspective and flat stacking context so
          the laptop's resting angle cannot intersect the overlay cards. */}
      <div className="relative flex w-full items-center justify-center py-4 sm:py-8 lg:py-4 [perspective:1400px]">

      {/* 1. Ambient Lighting & Pedestal Stage */}
      <div
        className="pointer-events-none absolute -bottom-6 sm:-bottom-8 left-1/2 h-[180px] sm:h-[220px] w-[115%] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-400/15 via-sky-300/10 to-indigo-400/10 blur-2xl sm:blur-3xl"
        aria-hidden="true"
      />

      {/* Circular 3D Pedestal */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-14 sm:h-16 w-[88%] sm:w-[90%] -translate-x-1/2 rounded-[100%] bg-gradient-to-b from-white/90 via-[#f0f0f4] to-[#d8d8df] border border-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.06)] [transform:rotateX(74deg)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-2 left-1/2 h-12 sm:h-14 w-[80%] sm:w-[82%] -translate-x-1/2 rounded-[100%] bg-gradient-to-b from-white to-[#f5f5f7] border border-black/5 [transform:rotateX(74deg)]"
        aria-hidden="true"
      />

      {/* 2. Central 3D Laptop Mockup Container */}
      <motion.div
        style={{ y: reduced ? 0 : laptopY }}
        transformTemplate={(_, generated) => `${generated === "none" ? "" : generated} rotateX(2deg) rotateY(var(--laptop-y)) rotateZ(var(--laptop-z))`}
        className="relative z-10 w-full max-w-[480px] sm:max-w-[530px] [transform-style:preserve-3d] [--laptop-y:-5deg] [--laptop-z:0.3deg] sm:[--laptop-y:-7deg] sm:[--laptop-z:0.45deg]">
        <div
          className="pointer-events-none absolute -bottom-2 left-1/2 h-7 w-[92%] -translate-x-1/2 rounded-[100%] bg-black/12 blur-xl sm:h-9 sm:blur-2xl"
          aria-hidden="true"
        />

        {/* Laptop Screen Lid */}
        <div className="relative z-20 origin-bottom overflow-hidden rounded-t-[15px] rounded-b-[4px] border border-[#343438] bg-[#171719] p-1.5 shadow-[0_16px_36px_-18px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.11),0_0_0_1px_rgba(0,0,0,0.16)] [transform:rotateX(-1deg)] sm:p-2">
          {/* Top Bezel: Camera notch/indicator */}
          <div className="flex items-center justify-center pb-1">
            <span className="h-1 w-1 rounded-full bg-[#0a0a0b] ring-1 ring-white/10" />
          </div>

          {/* Screen Glass Surface */}
          <div className="overflow-hidden rounded-lg bg-white shadow-inner">
            {/* Dashboard App Header */}
            <div className="flex h-9 sm:h-10 items-center justify-between border-b border-[var(--color-border-subtle)] bg-[#fafafa] px-2.5 sm:px-3">
              {/* Wordmark Mini */}
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                <span className="text-[11px] sm:text-[12px] font-semibold tracking-tight text-[var(--color-text-primary)]">
                  SkillBridge
                </span>
              </div>

              {/* Greeting */}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  Good morning,
                </span>
                <span className="text-[11px] font-medium text-[var(--color-text-primary)]">
                  Alex
                </span>
              </div>

              {/* Status / Profile Avatar */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-emerald-600 border border-emerald-200/60">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  Verified
                </span>
                <div className="h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-[8px] sm:text-[9px] font-medium text-white flex items-center justify-center">
                  A
                </div>
              </div>
            </div>

            {/* Dashboard Body Content */}
            <div className="flex bg-[#fcfcfd]">
              {/* Mini Left Sidebar */}
              <div className="hidden sm:flex w-12 sm:w-14 flex-col items-center gap-4 border-r border-[var(--color-border-subtle)] bg-[#fbfbfd] py-3 text-[var(--color-text-secondary)]">
                <span className="rounded-md bg-black/5 p-1.5 text-[var(--color-text-primary)]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                </span>
                <span className="p-1.5 hover:text-[var(--color-text-primary)]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="p-1.5 hover:text-[var(--color-text-primary)]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="p-1.5 hover:text-[var(--color-text-primary)]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </span>
              </div>

              {/* Main Dashboard Panel */}
              <div className="flex-1 p-2.5 sm:p-3.5">
                <div className="mb-2 sm:mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] sm:text-[12px] font-semibold text-[var(--color-text-primary)]">
                      Recommended for you
                    </span>
                    <span className="rounded-full bg-blue-50 px-1.5 py-0.2 text-[8px] sm:text-[9px] font-medium text-[var(--color-accent)] border border-blue-100">
                      Live
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-[var(--color-text-secondary)]">
                    Updated 5m ago
                  </span>
                </div>

                <ProjectFeed reduced={!!reduced} />
              </div>
            </div>
          </div>
        </div>

        {/* Hinge */}
        <div className="relative z-30 mx-auto -mt-px h-1.5 w-[31%] rounded-b-full bg-[#74767a] shadow-[0_1px_2px_rgba(0,0,0,0.16)] sm:h-2" />

        {/* Deep aluminum deck projected toward the viewer */}
        <div className="relative z-10 mx-auto -mt-0.5 -mb-9 h-24 w-[106%] origin-top overflow-hidden rounded-b-[13px] bg-[#b8bbc0] shadow-[0_28px_32px_-19px_rgba(0,0,0,0.38)] [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)] [transform:rotateX(56deg)] [transform-style:preserve-3d] sm:-mb-11 sm:h-28 sm:w-[110%]">
          <div className="absolute inset-px overflow-hidden rounded-b-[12px] bg-gradient-to-b from-[#eef0f2] via-[#d7d9dd] to-[#c2c5c9] [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)]">
            {/* Minimal, low-contrast keyboard impression */}
            <div className="absolute top-[10%] right-[11%] left-[11%] h-[40%] rounded-[6px] border border-black/[0.045] bg-[#55585d]/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.045)]">
              <div className="absolute inset-x-[5%] top-1/2 h-px bg-black/[0.035]" />
            </div>

            {/* Subtle centered trackpad */}
            <div className="absolute bottom-[12%] left-1/2 h-[31%] w-[30%] -translate-x-1/2 rounded-[6px] border border-black/[0.065] bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]" />

            {/* Restrained aluminum edge highlight */}
            <div className="absolute inset-x-[4%] top-0 h-px bg-white/85" />
          </div>

          {/* Wide metallic front edge */}
          <div className="absolute inset-x-0 bottom-0 h-[9%] border-t border-white/35 bg-[#a3a6ab] shadow-[0_3px_5px_rgba(0,0,0,0.14)]">
            <div className="absolute top-0 left-1/2 h-0.5 w-16 -translate-x-1/2 rounded-b-full bg-[#74777c]/55 sm:w-20" />
          </div>
        </div>
      </motion.div>

      {/* 3. Floating Overlay Cards */}

      {/* Card 1: Skill Match Card (Top-Left) */}
      <FloatingCard index={0} active={!reduced && visible} pointerActive={desktop && !reduced} reduced={!!reduced} rotateX={rotateX} rotateY={rotateY} className="absolute -top-3 sm:-top-4 -left-1 sm:-left-5 lg:-left-9 z-30 w-36 sm:w-44 lg:w-48 rounded-2xl border border-white/85 bg-white/95 p-2.5 sm:p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.08)] backdrop-blur-md [transform:translateZ(40px)_rotate(-3deg)]">
        <div className="flex items-center justify-between">
          <span className="rounded-lg bg-blue-50 p-1 text-[var(--color-accent)]">
            <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </span>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-semibold text-emerald-700">
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            96% Match
          </span>
        </div>
        <p className="mt-1.5 text-[11px] sm:text-[12px] font-semibold text-[var(--color-text-primary)]">
          React Developer
        </p>
        <p className="text-[9px] sm:text-[10px] text-[var(--color-text-secondary)]">
          ₹9,000 • 2 weeks
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="flex -space-x-1 overflow-hidden">
            <span className="inline-flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-indigo-500 text-[6px] sm:text-[7px] text-white ring-1 ring-white">
              S
            </span>
            <span className="inline-flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-amber-500 text-[6px] sm:text-[7px] text-white ring-1 ring-white">
              R
            </span>
          </div>
          <span className="text-[8px] sm:text-[9px] text-[var(--color-text-tertiary)]">
            +8 applied
          </span>
        </div>
      </FloatingCard>

      {/* Card 2: Portfolio Growth Card (Bottom-Left - Tablet & Desktop) */}
      <FloatingCard index={1} active={!reduced && visible} pointerActive={desktop && !reduced} reduced={!!reduced} rotateX={rotateX} rotateY={rotateY} className="hidden sm:block absolute -bottom-4 sm:-bottom-5 -left-1 sm:-left-4 lg:-left-7 z-30 w-38 sm:w-42 lg:w-44 rounded-2xl border border-white/85 bg-white/95 p-3 shadow-[0_14px_34px_rgba(0,0,0,0.08)] backdrop-blur-md [transform:translateZ(45px)_rotate(2deg)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-medium text-[var(--color-text-secondary)]">
            Grow your portfolio
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-600">
            +70%
          </span>
        </div>
        <p className="text-[9px] text-[var(--color-text-tertiary)]">
          Profile views
        </p>
        {/* SVG Sparkline Graph */}
        <div className="mt-1.5 h-7 w-full">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 100 32" fill="none">
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0071e3" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0071e3" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 26 C 20 22, 35 25, 50 14 C 65 5, 80 12, 100 3 L 100 32 L 0 32 Z"
              fill="url(#growthGrad)"
            />
            <path
              d="M0 26 C 20 22, 35 25, 50 14 C 65 5, 80 12, 100 3"
              stroke="#0071e3"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </FloatingCard>

      {/* Card 3: Floating Project Opportunity Card (Top-Right - Desktop) */}
      <FloatingCard index={2} active={!reduced && visible} pointerActive={desktop && !reduced} reduced={!!reduced} rotateX={rotateX} rotateY={rotateY} className="hidden lg:block absolute -top-4 -right-2 lg:-right-6 z-30 w-42 rounded-2xl border border-white/85 bg-white/95 p-3 shadow-[0_14px_34px_rgba(0,0,0,0.08)] backdrop-blur-md [transform:translateZ(35px)_rotate(3deg)]">
        <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-semibold text-[var(--color-accent)] border border-blue-100">
          <span className="h-1 w-1 rounded-full bg-[var(--color-accent)]" />
          New Opportunity
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-[var(--color-text-primary)]">
          UI/UX Designer
        </p>
        <p className="text-[9px] text-[var(--color-text-secondary)]">
          ₹5,000 • Remote
        </p>
        <div className="mt-1.5 flex justify-end">
          <span className="rounded-full bg-[var(--color-text-primary)] px-2 py-0.5 text-[8px] font-medium text-white shadow-xs">
            Apply Now
          </span>
        </div>
      </FloatingCard>

      {/* Card 4: Floating Project-Completed Card (Bottom-Right) */}
      <FloatingCard index={3} active={!reduced && visible} pointerActive={desktop && !reduced} reduced={!!reduced} rotateX={rotateX} rotateY={rotateY} className="absolute -bottom-2 sm:-bottom-3 -right-1 sm:-right-5 lg:-right-7 z-30 w-38 sm:w-44 lg:w-48 rounded-2xl border border-white/85 bg-white/95 p-2.5 sm:p-3 shadow-[0_14px_34px_rgba(0,0,0,0.08)] backdrop-blur-md [transform:translateZ(40px)_rotate(-2deg)]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-[var(--color-text-primary)]">
              Project Completed!
            </p>
            <p className="text-[9px] sm:text-[10px] font-medium text-emerald-600">
              You earned ₹8,000
            </p>
          </div>
        </div>
        <div className="mt-1.5 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-1 text-[8px] sm:text-[9px] text-[var(--color-text-secondary)]">
          <span>★ 5.0 client review</span>
          <span className="font-medium text-[var(--color-accent)]">Paid</span>
        </div>
      </FloatingCard>
      </div>
      </motion.div>
    </motion.div>
  );
}
