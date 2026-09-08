import React from "react";
import type { Metadata } from "next";
import { StudentLoginForm } from "@/components/student/student-login-form";

export const metadata: Metadata = {
  title: "Student Sign In | SkillBridge",
  description: "Sign in to your SkillBridge student account to browse projects and apply.",
};

export default function StudentLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas-surface)] px-4 py-12 sm:px-6 lg:px-8">
      <StudentLoginForm />
    </div>
  );
}
