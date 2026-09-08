"use client";

import { motion } from "framer-motion";

interface WorkProjectProgressProps {
  progress: number;
}

export function WorkProjectProgress({ progress }: WorkProjectProgressProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--color-text-primary)]">Project Progress</span>
        <span className="font-bold text-blue-600">{progress}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
        />
      </div>
    </div>
  );
}
