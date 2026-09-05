"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";

const query = "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (not (any-pointer: coarse))";
const subscribe = (callback: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
export function useDesktopMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

// One motion value drives each independent loop, without React frame updates.
export function useIdlePhase(active: boolean, duration: number, delay: number) {
  const phase = useMotionValue(0);
  useEffect(() => {
    if (!active) { phase.set(0); return; }
    const controls = animate(phase, [0, 1, 0, -1, 0], {
      duration, delay, repeat: Infinity, repeatType: "reverse", ease: "easeInOut",
    });
    return () => controls.stop();
  }, [active, phase, duration, delay]);
  return phase;
}

// Reference-inspired resting angles; idle and pointer transforms are additive.
const bases = [
  "translateZ(40px) rotateX(12deg) rotateY(10deg) rotateZ(-12deg)",
  "translateZ(45px) rotateX(15deg) rotateY(12deg) rotateZ(-15deg)",
  "translateZ(35px) rotateX(12deg) rotateY(-10deg) rotateZ(14deg)",
  "translateZ(40px) rotateX(15deg) rotateY(-12deg) rotateZ(15deg)",
];
const depths = [1.2, 0.8, 1.5, 1];
// Independent paths and periods keep the axes from reversing in lockstep.
// Closed paths ease to zero velocity at the seam, without a repeat pause.
const driftPaths = [
  [0, 3, -2, 4, 0],
  [0, -7, -3, 8, 0],
  [0, -1, 1.5, 0.5, 0],
  [0, 2, -1, -2.5, 0],
  [0, 0.6, -0.8, 0.3, 0],
];
const driftDurations = [4.2, 4.8, 5.4, 6];
const axisOffsets = [0.2, 0, 0.35, 0.5, 0.65];

function useCardDrift(active: boolean, desktop: boolean, index: number) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rz = useMotionValue(0);
  useEffect(() => {
    const values = [x, y, rx, ry, rz];
    if (!active) { values.forEach(value => value.set(0)); return; }
    const controls = values.flatMap((value, axis) => {
      // Mobile runs just two light tracks: vertical drift and a tiny roll.
      if (!desktop && axis !== 1 && axis !== 4) { value.set(0); return []; }
      const scale = desktop ? 1 : axis === 1 ? 0.45 : 0.4;
      const direction = (index + axis) % 2 === 0 ? 1 : -1;
      return [animate(value, driftPaths[axis].map(point => point * scale * direction), {
        duration: driftDurations[index] + axisOffsets[axis],
        delay: 0.15 + index * 0.22 + axis * 0.08,
        times: [0, 0.24, 0.51, 0.77, 1],
        repeat: Infinity, repeatType: "loop", ease: "easeInOut",
      })];
    });
    return () => controls.forEach(control => control.stop());
  }, [active, desktop, index, x, y, rx, ry, rz]);
  return { x, y, rx, ry, rz };
}
export function FloatingCard({ children, className, index, active, pointerActive, reduced, rotateX, rotateY }: {
  children: ReactNode; className: string; index: number; active: boolean; pointerActive: boolean; reduced: boolean;
  rotateX: MotionValue<number>; rotateY: MotionValue<number>;
}) {
  const idle = useCardDrift(active && !reduced, pointerActive, index);
  const x = useTransform(() => idle.x.get() + (pointerActive && !reduced ? rotateY.get() * depths[index] : 0));
  const y = useTransform(() => idle.y.get() + (pointerActive && !reduced ? -rotateX.get() * depths[index] : 0));
  const tiltX = useTransform(() => idle.rx.get() + (pointerActive && !reduced ? rotateX.get() * 0.3 * depths[index] : 0));
  const tiltY = useTransform(() => idle.ry.get() + (pointerActive && !reduced ? rotateY.get() * 0.3 * depths[index] : 0));
  return (
    <motion.div className={className} style={{
      x: reduced ? 0 : x, y: reduced ? 0 : y,
      rotateX: reduced ? 0 : tiltX, rotateY: reduced ? 0 : tiltY, rotateZ: reduced ? 0 : idle.rz,
    }}
      transformTemplate={(_, generated) => `${generated === "none" ? "" : generated} ${bases[index]}`}
      initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.35 + index * 0.09 }}>
      {children}
    </motion.div>
  );
}
