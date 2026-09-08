"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ClientSidebar } from "@/components/client/client-sidebar";
import { ClientDashboardHeader } from "@/components/client/client-dashboard-header";
import { ClientAuthProvider, useClientAuth } from "@/components/client/client-auth-context";

function ClientDashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading } = useClientAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === "/client/login" || pathname === "/client/signup";

  useEffect(() => {
    // If auth finishes loading and user is not authenticated on a protected route, redirect to /client/login
    if (!isLoading && !user && !isAuthPage) {
      router.replace(`/client/login?from=${encodeURIComponent(pathname || "/client/dashboard")}`);
    }
  }, [user, isLoading, router, pathname, isAuthPage]);

  // For standalone login/signup pages, render children directly within ClientAuthProvider
  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas-surface)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-text-primary)] border-t-transparent" />
          <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
            Loading Client Workspace...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAuthProvider>
      <ClientDashboardShell>{children}</ClientDashboardShell>
    </ClientAuthProvider>
  );
}
