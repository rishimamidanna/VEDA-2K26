"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { DashboardPreview } from "./dashboard-preview";
import { FloatingCards } from "./floating-cards";

export function ProductVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const y = useTransform(smoothScroll, [0, 1], [0, -40]);
  const opacity = useTransform(smoothScroll, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // We can use a custom hook for mouse parallax if needed, but for simplicity we can just apply a basic CSS transform
  // The prompt asks for:
  // rotateY(-6deg)
  // rotateX(2deg)
  // rotateZ(-0.5deg)

  return (
    <motion.div
      ref={containerRef}
      style={{ y, opacity }}
      className="relative flex h-full w-full items-center justify-center pt-12 md:pt-0"
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div
          className="h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(124, 140, 255, 0.07), rgba(167, 139, 250, 0.025) 40%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Parallax Container */}
      <div className="relative z-10 w-full max-w-[800px] perspective-[1200px] sm:perspective-[1600px]">
        {/* Floating Cards */}
        <FloatingCards />

        {/* 3D Product Container */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 0, rotateY: 0 }}
          animate={{ opacity: 1, y: 0, rotateX: 2, rotateY: -6, rotateZ: -0.5 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative mx-auto w-full aspect-[16/10] sm:aspect-[16/9] md:w-[90%]"
        >
          {/* Decorative Back Panels for Depth */}
          <div
            className="absolute inset-0 rounded-[24px] bg-white/20 border border-white/30 backdrop-blur-sm"
            style={{ transform: "translateZ(-20px) scale(0.95)", opacity: 0.5 }}
          />
          <div
            className="absolute inset-0 rounded-[24px] bg-white/40 border border-white/50 backdrop-blur-md"
            style={{ transform: "translateZ(-10px) scale(0.98)", opacity: 0.7 }}
          />

          {/* Main Device/Screen */}
          <div
            className="absolute inset-0 flex flex-col overflow-hidden rounded-[20px] sm:rounded-[26px] bg-white shadow-2xl"
            style={{
              transform: "translateZ(0)",
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 30px 70px rgba(0,0,0,0.10), 0 8px 25px rgba(0,0,0,0.05)",
            }}
          >
            {/* Screen Inner Highlight */}
            <div className="pointer-events-none absolute inset-0 z-50 rounded-[20px] sm:rounded-[26px] shadow-[inset_0_1px_1px_rgba(255,255,255,1)]" />
            
            <DashboardPreview />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
