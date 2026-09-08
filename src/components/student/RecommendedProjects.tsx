"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { ProjectCard } from "./ProjectCard";

interface RecommendedProjectItem {
  id: string;
  title: string;
  budget: string;
  duration: string;
  match: number;
  skills: string[];
  category: string;
}

export function RecommendedProjects() {
  const [projects, setProjects] = useState<RecommendedProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<RecommendedProjectItem[]>("/api/projects/recommended");
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load project recommendations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

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
            Open marketplace projects matched to your verified skills.
          </p>
        </div>
        <Link
          href="/student/projects"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View all <ArrowRight size={14} />
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-5 animate-pulse"
            >
              <div className="h-5 w-24 rounded bg-gray-100" />
              <div className="h-6 w-3/4 rounded bg-gray-100" />
              <div className="h-4 w-1/2 rounded bg-gray-100" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-16 rounded bg-gray-100" />
                <div className="h-6 w-16 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/60 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchRecommendations}
            className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-white p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">No recommendations right now</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            You may have applied to all matching open projects, or update your profile skills to see more matches.
          </p>
          <Link
            href="/student/projects"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
          >
            Explore all open projects &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} {...project} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
