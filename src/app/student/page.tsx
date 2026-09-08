"use client";

import { motion } from "framer-motion";
import { StudentLayout } from "@/components/student/StudentLayout";
import {
  WelcomeSection,
  StudentStats,
  RecommendedProjects,
  RecentApplications,
  ActiveProject,
} from "@/components/student";

export default function StudentDashboardPage() {
  return (
    <StudentLayout title="Dashboard">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <WelcomeSection />
        <StudentStats />

        {/* Two-column grid on large screens */}
        <RecommendedProjects />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <RecentApplications />
          <ActiveProject />
        </div>
      </motion.div>
    </StudentLayout>
  );
}
