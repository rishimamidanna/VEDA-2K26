"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { recommendedProjects } from "@/data/student";
import { ProjectCard } from "./ProjectCard";

export function RecommendedProjects() {
  return (
    <section className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-4 flex items-end justify-between"
      >
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Recommended for you
          </h2>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            Projects matched to your skills.
          </p>
        </div>
        <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View all <ArrowRight size={14} />
        </button>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendedProjects.map((project, i) => (
          <ProjectCard key={project.id} {...project} index={i} />
        ))}
      </div>
    </section>
  );
}
