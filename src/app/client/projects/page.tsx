import React from "react";
import type { Metadata } from "next";
import { ClientProjectsList } from "@/components/client";

export const metadata: Metadata = {
  title: "My Projects | Client Portal | SkillBridge",
  description: "Track and manage your posted student freelance projects on SkillBridge.",
};

export default function ClientProjectsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <ClientProjectsList />
    </div>
  );
}
