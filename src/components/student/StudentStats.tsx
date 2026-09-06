"use client";

import { motion } from "framer-motion";
import { FileText, Briefcase, CheckCircle2, TrendingUp } from "lucide-react";
import { studentStats } from "@/data/student";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FileText,
  Briefcase,
  CheckCircle: CheckCircle2,
  TrendingUp,
};

const accentColors: Record<string, string> = {
  FileText: "bg-blue-50 text-blue-600",
  Briefcase: "bg-violet-50 text-violet-600",
  CheckCircle: "bg-emerald-50 text-emerald-600",
  TrendingUp: "bg-orange-50 text-orange-600",
};

export function StudentStats() {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {studentStats.map((stat, i) => {
        const Icon = iconMap[stat.icon];
        const colorClass = accentColors[stat.icon];
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
            whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}
            className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-white p-5 cursor-default transition-shadow"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}>
              {Icon && <Icon size={20} />}
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
