"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  getHasIntroPlayed,
  setIntroPhase,
  skipIntroDirectly,
} from "./intro-state";

const BRAND_NAME = "SkillBridge";
const BRAND_LETTERS = BRAND_NAME.split("");

export function BrandIntro() {
  const reduced = useReducedMotion();
  const [isActive, setIsActive] = useState(() => !getHasIntroPlayed());
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    document.body.style.overflow = "hidden";

    // Reduced motion timeline: simplified quick crossfade
    if (reduced) {
      const crossfadeTimer = setTimeout(() => {
        setIsExiting(true);
        setIntroPhase("crossfade");
      }, 600);

      const completeTimer = setTimeout(() => {
        setIntroPhase("complete");
        setIsActive(false);
        document.body.style.overflow = "";
      }, 1050);

      return () => {
        clearTimeout(crossfadeTimer);
        clearTimeout(completeTimer);
        document.body.style.overflow = "";
      };
    }

    // Standard sequence:
    // 0.0s - 1.1s: Letters reveal staggered (~58ms apart)
    // 1.15s - 1.4s: Dot reveals with subtle single scale pulse
    // 1.4s - 1.7s: Hold logo (~300ms hold)
    // 1.7s: Begin crossfade (overlay fades out over ~750ms while navbar & hero reveal)
    // 2.45s: Crossfade completes, overlay unmounts
    const crossfadeTimer = setTimeout(() => {
      setIsExiting(true);
      setIntroPhase("crossfade");
    }, 1700);

    const completeTimer = setTimeout(() => {
      setIntroPhase("complete");
      setIsActive(false);
      document.body.style.overflow = "";
    }, 2450);

    // Absolute fallback timer
    const safetyTimer = setTimeout(() => {
      setIntroPhase("complete");
      setIsActive(false);
      document.body.style.overflow = "";
    }, 2700);

    return () => {
      clearTimeout(crossfadeTimer);
      clearTimeout(completeTimer);
      clearTimeout(safetyTimer);
      document.body.style.overflow = "";
    };
  }, [isActive, reduced]);

  // Click or Escape key allows instant skip
  const handleDismiss = () => {
    skipIntroDirectly();
    setIsActive(false);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.aside
          key="brand-intro-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-canvas-bg)] cursor-default select-none overflow-hidden"
          aria-label="SkillBridge introduction"
          role="status"
          aria-live="polite"
        >
          {/* Logo Group */}
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={
              isExiting
                ? { opacity: 0, y: -10, scale: 0.985 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-baseline font-semibold tracking-tight text-[var(--color-text-primary)] text-4xl sm:text-5xl lg:text-[60px]"
          >
            {reduced ? (
              // Reduced motion: whole logo appears at once without letter drift or blur
              <span>{BRAND_NAME}</span>
            ) : (
              // Full experience: letter-by-letter reveal with subtle blur and lift
              <span>
                {BRAND_LETTERS.map((letter, index) => (
                  <motion.span
                    key={`${letter}-${index}`}
                    initial={{ opacity: 0, y: 10, filter: "blur(5px)", scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                    transition={{
                      duration: 0.32,
                      delay: 0.12 + index * 0.058,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            )}

            {/* Brand Dot */}
            <motion.span
              initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              animate={
                reduced
                  ? { opacity: 1, scale: 1 }
                  : {
                      opacity: 1,
                      scale: [0, 1.25, 1],
                    }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      duration: 0.38,
                      delay: 0.12 + BRAND_LETTERS.length * 0.058 + 0.06,
                      times: [0, 0.65, 1],
                      ease: [0.22, 1, 0.36, 1],
                    }
              }
              className="inline-block h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3 rounded-full bg-[var(--color-accent)] ml-1.5 sm:ml-2 mb-0.5 sm:mb-1"
              aria-hidden="true"
            />
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
