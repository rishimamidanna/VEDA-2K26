"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function BrandIntro() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Only run on initial load for the session
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    if (hasSeenIntro) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(false);
      return;
    }

    sessionStorage.setItem("hasSeenIntro", "true");

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 800); // Wait for fade out
    }, 2800); // 2.8s total intro time

    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) return null;

  const letters = "SkillBridge".split("");

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-canvas-bg)]"
        >
          <div className="flex items-baseline text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.08,
                  ease: [0.2, 0.65, 0.3, 0.9],
                }}
              >
                {letter}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: letters.length * 0.08 + 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="ml-1 h-3 w-3 rounded-full bg-blue-500 sm:h-4 sm:w-4"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
