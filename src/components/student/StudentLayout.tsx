"use client";

import { useState } from "react";
import { StudentSidebar } from "@/components/student";
import { StudentHeader } from "@/components/student";

interface StudentLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function StudentLayout({ children, title = "Dashboard" }: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-canvas-bg)]">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <StudentHeader title={title} onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
