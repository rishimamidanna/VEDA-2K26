import React from "react";
import type { Metadata } from "next";
import { TalentDirectory } from "@/components/client";

export const metadata: Metadata = {
  title: "Find Talent | Client Portal | SkillBridge",
  description: "Browse verified student freelancers in engineering, design, and content on SkillBridge.",
};

export default function ClientTalentPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <TalentDirectory />
    </div>
  );
}
