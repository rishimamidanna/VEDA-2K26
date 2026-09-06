"use client";

import React, { useState } from "react";
import { ClientSidebar } from "@/components/client/client-sidebar";
import { ClientDashboardHeader } from "@/components/client/client-dashboard-header";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--color-canvas-surface)] text-[var(--color-text-primary)]">
      {/* Client Sidebar (Desktop sticky + mobile drawer) */}
      <ClientSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <ClientDashboardHeader
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
