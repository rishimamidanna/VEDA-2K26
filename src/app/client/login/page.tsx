import React from "react";
import type { Metadata } from "next";
import { ClientLoginForm } from "@/components/client";

export const metadata: Metadata = {
  title: "Client Sign In | SkillBridge",
  description: "Sign in to your client account to manage projects and hire student freelancers.",
};

export default function ClientLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[var(--color-canvas-surface)]">
      <ClientLoginForm />
    </div>
  );
}
