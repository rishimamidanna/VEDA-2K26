"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useSpring, useInView } from "framer-motion";
import { FloatingCard, useDesktopMotion } from "./hero-motion";
import { DashboardContent } from "./dashboard-content";

// Smooth placeholder while the 3D canvas lazily loads
function LaptopSkeleton() {
  return (
    <div className="relative h-[370px] sm:h-[420px] lg:h-[480px] w-full flex items-center justify-center select-none">
      <div className="relative w-[90%] max-w-[480px] rounded-t-xl rounded-b-md border border-[#2a2b2f] bg-[#161719] p-1.5 shadow-xl animate-pulse">
        <div className="flex items-center justify-center pb-1">
          <span className="h-1 w-1 rounded-full bg-[#08080a] ring-1 ring-white/15" />
        </div>
        <div className="h-[210px] sm:h-[245px] overflow-hidden rounded bg-white shadow-inner">
          <DashboardContent reduced={true} />
        </div>
        <div className="mx-auto mt-1 h-1.5 w-[26%] rounded-b-xs bg-[#1a1b1e]" />
      </div>
    </div>
  );
}

// Lazy load the 3D scene client-side
const Laptop3D = dynamic(
  () => import("@/components/3d/laptop-3d").then((mod) => mod.Laptop3D),
  {
    ssr: false,
    loading: () => <LaptopSkeleton />,
  }
);

export function HeroVisual() {
  const reduced = useReducedMotion();
  const desktop = useDesktopMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const rotateX = useSpring(0, { stiffness: 90, damping: 24 });
  const rotateY = useSpring(0, { stiffness: 90, damping: 24 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={(event) => {
        if (!desktop || reduced || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
        const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
        rotateX.set(-y * 2.5);
        rotateY.set(x * 4);
        setMousePos({ x, y });
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
      className="relative mx-auto w-full max-w-[560px] [perspective:1400px]">
      {/* Perspective belongs to the stationary parent; rotate its 3D scene.
          Pointer coordinates also use that parent to avoid a moving hit area. */}
      <motion.div
        style={{ rotateX: desktop && !reduced ? rotateX : 0, rotateY: desktop && !reduced ? rotateY : 0 }}
        className="relative w-full [transform-style:preserve-3d]">
        <div className="relative flex w-full items-center justify-center py-4 sm:py-8 lg:py-4 [perspective:1400px]">
          {/* Restrained studio floor shadow */}
          <div
            className="pointer-events-none absolute bottom-[7%] left-1/2 h-7 w-[72%] -translate-x-1/2 rounded-[100%] bg-black/[0.035] blur-xl sm:h-9"
            aria-hidden="true"
          />

          {/* 2. Real 3D Laptop (React Three Fiber) */}
          <div className="relative z-10 w-full">
            <Laptop3D
              pointerX={mousePos.x}
              pointerY={mousePos.y}
              reduced={!!reduced}
            />
          </div>

      {/* 3. Floating Overlay Cards */}

      {/* Card 1: Skill Match Card (Top-Left) */}
      <FloatingCard index={0} active={!reduced && visible} pointerActive={desktop && !reduced} reduced={!!reduced} rotateX={rotateX} rotateY={rotateY} className="absolute top-[18%] sm:top-[8%] -left-2 sm:-left-8 lg:-left-16 z-30 w-36 sm:w-44 lg:w-48 rounded-2xl border border-white/85 bg-white/95 p-2.5 sm:p-3.5 shadow-[0_16px_34px_rgba(0,0,0,0.09)] backdrop-blur-md">
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
      <FloatingCard index={1} active={!reduced && visible} pointerActive={desktop && !reduced} reduced={!!reduced} rotateX={rotateX} rotateY={rotateY} className="hidden sm:block absolute bottom-[8%] sm:bottom-[12%] -left-1 sm:-left-6 lg:-left-10 z-30 w-38 sm:w-42 lg:w-44 rounded-2xl border border-white/85 bg-white/95 p-3 shadow-[0_16px_34px_rgba(0,0,0,0.09)] backdrop-blur-md">
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
      <FloatingCard index={2} active={!reduced && visible} pointerActive={desktop && !reduced} reduced={!!reduced} rotateX={rotateX} rotateY={rotateY} className="hidden lg:block absolute top-[5%] -right-4 lg:-right-12 z-30 w-42 rounded-2xl border border-white/85 bg-white/95 p-3 shadow-[0_16px_34px_rgba(0,0,0,0.09)] backdrop-blur-md">
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
      <FloatingCard index={3} active={!reduced && visible} pointerActive={desktop && !reduced} reduced={!!reduced} rotateX={rotateX} rotateY={rotateY} className="absolute bottom-[10%] sm:bottom-[15%] -right-1 sm:-right-6 lg:-right-12 z-30 w-38 sm:w-44 lg:w-48 rounded-2xl border border-white/85 bg-white/95 p-2.5 sm:p-3 shadow-[0_16px_34px_rgba(0,0,0,0.09)] backdrop-blur-md">
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
