"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { StudentSidebar } from "@/components/student";
import { StudentHeader } from "@/components/student";
import { StudentAuthProvider, useStudentAuth } from "@/components/student/student-auth-context";

interface StudentLayoutProps {
  children: React.ReactNode;
  title?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
}

function StudentLayoutInner({
  children,
  title = "Dashboard",
  fullWidth = false,
  noPadding = false,
}: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useStudentAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/student/login?from=${encodeURIComponent(pathname || "/student")}`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-canvas-surface)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-text-primary)] border-t-transparent" />
          <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
            Loading Student Portal...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-canvas-bg)]">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <StudentHeader title={title} onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable content */}
        <main
          className={
            noPadding
              ? "flex flex-1 overflow-hidden"
              : "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
          }
        >
          {fullWidth ? (
            children
          ) : (
            <div className="mx-auto w-full">{children}</div>
          )}
        </main>
      </div>
    </div>
  );
}

export function StudentLayout(props: StudentLayoutProps) {
  return (
    <StudentAuthProvider>
      <StudentLayoutInner {...props} />
    </StudentAuthProvider>
  );
}
