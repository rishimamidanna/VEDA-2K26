import React from "react";
import type { Metadata } from "next";
import { HiredStudentsList } from "@/components/client/hired-students-list";

export const metadata: Metadata = {
  title: "Hired Students | Client Portal | SkillBridge",
  description: "View and manage accepted student proposals across all your client projects.",
};

export default function HiredStudentsPage() {
  return <HiredStudentsList />;
}
