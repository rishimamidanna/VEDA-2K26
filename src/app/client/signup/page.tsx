import React from "react";
import type { Metadata } from "next";
import { ClientSignupForm } from "@/components/client";

export const metadata: Metadata = {
  title: "Client Sign Up | SkillBridge",
  description: "Create a client account to post projects and hire verified student freelancers.",
};

export default function ClientSignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[var(--color-canvas-surface)]">
      <ClientSignupForm />
    </div>
  );
}
