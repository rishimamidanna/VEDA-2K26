"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Briefcase, CheckCircle2, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface StudentDashboardData {
  stats: {
    applications: number;
    activeProjects: number;
    completed: number;
    profileStrength: number;
  };
}

export function StudentStats() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<StudentDashboardData>("/api/dashboard/student");
      if (res?.stats) {
        setData(res);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-5 animate-pulse"
          >
            <div className="h-10 w-10 rounded-xl bg-gray-100" />
            <div className="space-y-2">
              <div className="h-7 w-12 rounded-md bg-gray-100" />
              <div className="h-4 w-20 rounded-md bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mb-8 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/60 p-4 text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error || "Failed to load dashboard statistics"}</span>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const statsConfig = [
    {
      label: "Applications",
      value: String(data.stats.applications),
      icon: FileText,
      colorClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Active Projects",
      value: String(data.stats.activeProjects),
      icon: Briefcase,
      colorClass: "bg-violet-50 text-violet-600",
    },
    {
      label: "Completed",
      value: String(data.stats.completed),
      icon: CheckCircle2,
      colorClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Profile Strength",
      value: `${data.stats.profileStrength}%`,
      icon: TrendingUp,
      colorClass: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {statsConfig.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
            whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}
            className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-5 cursor-default transition-shadow"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.colorClass}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--color-text-primary)]">
                {stat.value}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
