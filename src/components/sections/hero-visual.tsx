"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, useSpring, useInView } from "framer-motion";
import { FloatingCard, useDesktopMotion } from "./hero-motion";
import { DashboardContent } from "./dashboard-content";

export function HeroVisual() {
  const reduced = useReducedMotion();
  const desktop = useDesktopMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const rotateX = useSpring(0, { stiffness: 90, damping: 24 });
  const rotateY = useSpring(0, { stiffness: 90, damping: 24 });

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
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
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
      className="relative mx-auto w-full max-w-[560px] px-2 sm:px-3 lg:px-0 [perspective:1400px]">
      {/* Perspective belongs to the stationary parent; rotate its 3D scene.
          Pointer coordinates also use that parent to avoid a moving hit area. */}
      <motion.div
        style={{ rotateX: desktop && !reduced ? rotateX : 0, rotateY: desktop && !reduced ? rotateY : 0 }}
        className="relative w-full [transform-style:preserve-3d]">
        <div className="relative flex w-full items-center justify-center py-2 sm:py-4 lg:py-2 [perspective:1400px]">
          {/* Extremely subtle ambient background gradient */}
          <div 
            className="pointer-events-none absolute top-1/2 left-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124, 140, 255, 0.035), rgba(167, 139, 250, 0.015) 45%, transparent 70%)' }}
            aria-hidden="true"
          />

          {/* Decorative Backing Panel 2 (Deepest) */}
          <div 
            className="absolute z-0 w-[95%] max-w-[500px] h-[340px] sm:h-[400px] lg:h-[440px] rounded-[22px] bg-white/30 border border-white/40"
            style={{ 
              transform: desktop && !reduced ? 'translateZ(-40px) translateX(25px) translateY(-5px) rotateY(-3deg) rotateX(1deg) rotateZ(-0.5deg)' : 'none', 
              transformStyle: 'preserve-3d',
              willChange: 'transform'
            }}
          />

          {/* Decorative Backing Panel 1 (Middle) */}
          <div 
            className="absolute z-0 w-[95%] max-w-[530px] h-[340px] sm:h-[400px] lg:h-[440px] rounded-[22px] bg-white/60 border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
            style={{ 
              transform: desktop && !reduced ? 'translateZ(-20px) translateX(12px) translateY(-2px) rotateY(-3deg) rotateX(1deg) rotateZ(-0.5deg)' : 'none', 
              transformStyle: 'preserve-3d',
              willChange: 'transform'
            }}
          />

          {/* Premium Software Product Window (Front) */}
          <div 
            className="relative z-10 w-[95%] max-w-[560px] rounded-[22px] bg-white p-2 shadow-[0_30px_70px_rgba(20,20,35,0.08),0_10px_25px_rgba(20,20,35,0.04),0_2px_6px_rgba(20,20,35,0.02)] border border-[#141423]/[0.08]"
            style={{ 
              transform: desktop && !reduced ? 'rotateY(-3deg) rotateX(1deg) rotateZ(-0.5deg)' : 'none', 
              transformStyle: 'preserve-3d',
              willChange: 'transform'
            }}
          >
            {/* Very thin subtle edge highlight inner border */}
            <div className="pointer-events-none absolute inset-0 z-20 rounded-[22px] border border-white/80" />
            
            {/* Top UI Framing Line */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 z-20 rounded-t-[22px]" />
            
            {/* The Dashboard */}
            <div className="relative flex flex-col h-[340px] w-full overflow-hidden rounded-[14px] bg-white sm:h-[400px] lg:h-[440px]">
              <DashboardContent reduced={!!reduced} />
            </div>
          </div>

      {/* 3. Floating Overlay Cards */}

      {/* Card 1: Skill Match Card (Top-Left) */}
      <FloatingCard index={0} active={!reduced && visible} pointerActive={desktop && !reduced} reduced={!!reduced} rotateX={rotateX} rotateY={rotateY} className="absolute top-[12%] sm:-top-[2%] -left-1 sm:-left-3 lg:-left-5 z-30 w-32 sm:w-40 lg:w-44 rounded-2xl border border-[#141423]/[0.07] bg-white/98 p-2.5 sm:p-3 shadow-[0_16px_36px_rgba(20,20,35,0.10),0_4px_12px_rgba(20,20,35,0.05)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="rounded-lg bg-blue-50 p-1 text-[var(--color-accent)]">
            <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </span>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-semibold text-emerald-700">
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            96% Match
          </span>
        </div>
        <p className="mt-1.5 text-[11px] sm:text-[12px] font-semibold text-[#1c1c1e]">
          React Developer
        </p>
        <p className="text-[9px] sm:text-[10px] font-medium text-[#5c5c62]">
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
          <span className="text-[8px] sm:text-[9px] font-medium text-[#7c7c82]">
            +8 applied
          </span>
        </div>
      </FloatingCard>

      {/* Card 2: Portfolio Growth Card (Bottom-Left - Tablet & Desktop) */}
      <FloatingCard index={1} active={!reduced && visible} pointerActive={desktop && !reduced} reduced={!!reduced} rotateX={rotateX} rotateY={rotateY} className="hidden sm:block absolute bottom-[6%] sm:bottom-[8%] -left-0 sm:-left-3 lg:-left-5 z-30 w-32 sm:w-36 lg:w-40 rounded-2xl border border-[#141423]/[0.07] bg-white/98 p-2.5 sm:p-3 shadow-[0_16px_36px_rgba(20,20,35,0.10),0_4px_12px_rgba(20,20,35,0.05)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-medium text-[#5c5c62]">
            Grow your portfolio
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-600">
            +70%
          </span>
        </div>
        <p className="text-[9px] text-[#7c7c82]">
          Profile views
        </p>
        {/* SVG Sparkline Graph */}
        <div className="mt-1.5 h-7 w-full">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 100 32" fill="none" aria-hidden="true">
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
      <FloatingCard index={2} active={!reduced && visible} pointerActive={desktop && !reduced} reduced={!!reduced} rotateX={rotateX} rotateY={rotateY} className="hidden lg:block absolute top-[4%] -right-2 lg:-right-4 z-30 w-40 rounded-2xl border border-[#141423]/[0.07] bg-white/98 p-3 shadow-[0_16px_36px_rgba(20,20,35,0.10),0_4px_12px_rgba(20,20,35,0.05)] backdrop-blur-md">
        <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-semibold text-[var(--color-accent)] border border-blue-100">
          <span className="h-1 w-1 rounded-full bg-[var(--color-accent)]" />
          New Opportunity
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-[#1c1c1e]">
          UI/UX Designer
        </p>
        <p className="text-[9px] font-medium text-[#5c5c62]">
          ₹5,000 • Remote
        </p>
        <div className="mt-1.5 flex justify-end">
          <span className="rounded-full bg-[var(--color-text-primary)] px-2 py-0.5 text-[8px] font-medium text-white shadow-xs">
            Apply Now
          </span>
        </div>
      </FloatingCard>

      {/* Card 4: Floating Project-Completed Card (Bottom-Right) */}
      <FloatingCard index={3} active={!reduced && visible} pointerActive={desktop && !reduced} reduced={!!reduced} rotateX={rotateX} rotateY={rotateY} className="absolute bottom-[8%] sm:bottom-[10%] -right-0 sm:-right-2 lg:-right-4 z-30 w-32 sm:w-40 lg:w-44 rounded-2xl border border-[#141423]/[0.07] bg-white/98 p-2.5 sm:p-3 shadow-[0_16px_36px_rgba(20,20,35,0.10),0_4px_12px_rgba(20,20,35,0.05)] backdrop-blur-md">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-[#1c1c1e]">
              Project Completed!
            </p>
            <p className="text-[9px] sm:text-[10px] font-medium text-emerald-600">
              You earned ₹8,000
            </p>
          </div>
        </div>
        <div className="mt-1.5 flex items-center justify-between border-t border-[#14141e]/[0.06] pt-1.5 text-[8px] sm:text-[9px] text-[#636366]">
          <span>★ 5.0 client review</span>
          <span className="font-semibold text-[var(--color-accent)]">Paid</span>
        </div>
      </FloatingCard>
      </div>
      </motion.div>
    </motion.div>
  );
}
