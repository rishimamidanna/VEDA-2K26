"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItemConfig {
  label: string;
  href: string;
  icon: (props: { className?: string; "aria-hidden"?: boolean }) => React.JSX.Element;
  badge?: string;
}

export const CLIENT_SIDEBAR_ITEMS: NavItemConfig[] = [
  {
    label: "Dashboard",
    href: "/client/dashboard",
    icon: ({ className, "aria-hidden": ariaHidden }) => (
      <svg
        className={className}
        aria-hidden={ariaHidden}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    label: "Post a Project",
    href: "/client/dashboard#post-project",
    icon: ({ className, "aria-hidden": ariaHidden }) => (
      <svg
        className={className}
        aria-hidden={ariaHidden}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    label: "My Projects",
    href: "/client/dashboard#projects",
    icon: ({ className, "aria-hidden": ariaHidden }) => (
      <svg
        className={className}
        aria-hidden={ariaHidden}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <rect width="20" height="14" x="2" y="6" rx="2" />
      </svg>
    ),
  },
  {
    label: "Applicants",
    href: "/client/dashboard#applicants",
    icon: ({ className, "aria-hidden": ariaHidden }) => (
      <svg
        className={className}
        aria-hidden={ariaHidden}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Find Talent",
    href: "/client/dashboard#find-talent",
    icon: ({ className, "aria-hidden": ariaHidden }) => (
      <svg
        className={className}
        aria-hidden={ariaHidden}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    label: "Hired Students",
    href: "/client/dashboard#hired",
    icon: ({ className, "aria-hidden": ariaHidden }) => (
      <svg
        className={className}
        aria-hidden={ariaHidden}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    label: "Messages",
    href: "/client/dashboard#messages",
    icon: ({ className, "aria-hidden": ariaHidden }) => (
      <svg
        className={className}
        aria-hidden={ariaHidden}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    ),
  },
  {
    label: "Payments",
    href: "/client/dashboard#payments",
    icon: ({ className, "aria-hidden": ariaHidden }) => (
      <svg
        className={className}
        aria-hidden={ariaHidden}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/client/dashboard#settings",
    icon: ({ className, "aria-hidden": ariaHidden }) => (
      <svg
        className={className}
        aria-hidden={ariaHidden}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ClientSidebar({ isOpen, onClose, className }: ClientSidebarProps) {
  const pathname = usePathname();

  // Handle ESC key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5">
      <div className="flex flex-col gap-6">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-2 pt-1 pb-1">
          <Link
            href="/"
            className="group flex items-center gap-2.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-lg"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-text-primary)] text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
              <span className="text-[14px] font-bold tracking-tight">SB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">
                SkillBridge
              </span>
              <span className="text-[11px] font-medium text-[var(--color-text-secondary)] -mt-0.5">
                Client Portal
              </span>
            </div>
          </Link>

          {/* Close button inside mobile drawer */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-black/5 active:bg-black/10 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Section */}
        <nav aria-label="Client Navigation" className="flex flex-col space-y-1">
          {CLIENT_SIDEBAR_ITEMS.map((item) => {
            const isActive = item.label === "Dashboard" && pathname === "/client/dashboard";
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  if (isOpen) onClose();
                }}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-150 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
                  isActive
                    ? "bg-[var(--color-text-primary)] text-white shadow-xs font-semibold"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <Icon
                  aria-hidden={true}
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)]"
                  )}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[var(--color-canvas-surface)] text-[var(--color-text-secondary)]"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User / Workspace Footer Card */}
      <div className="pt-4 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--color-canvas-surface)]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0071e3]/15 to-[#5a6ef5]/25 text-[#0071e3] font-semibold text-[13px]">
            CP
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">
              Client Partner
            </span>
            <span className="text-[11px] text-[var(--color-text-tertiary)] truncate">
              client@skillbridge.co
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex w-64 shrink-0 flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] sticky top-0 h-screen",
          className
        )}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer (Accessible modal sheet) */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-visibility duration-200",
          isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
        )}
        aria-hidden={!isOpen}
      >
        {/* Backdrop overlay */}
        <div
          onClick={onClose}
          className={cn(
            "fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200 ease-out",
            isOpen ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Drawer slide-in panel */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 w-[280px] max-w-[85vw] bg-[var(--color-canvas-bg)] shadow-2xl transition-transform duration-250 ease-out flex flex-col z-10",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {navContent}
        </div>
      </div>
    </>
  );
}
