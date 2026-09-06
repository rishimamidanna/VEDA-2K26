"use client";

import { motion } from "framer-motion";
import { studentProfile } from "@/data/student";

export function WelcomeSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-8"
    >
      <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] sm:text-3xl">
        Good afternoon, {studentProfile.name.split(" ")[0]}.
      </h2>
      <p className="mt-1 text-lg font-medium text-[var(--color-text-primary)]">
        Find your next opportunity.
      </p>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)] max-w-lg">
        Discover projects that match your skills and help you build real experience.
      </p>
    </motion.div>
  );
}
