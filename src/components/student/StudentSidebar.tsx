"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { navItems, studentProfile } from "@/data/student";
import {
  LayoutDashboard,
  Search,
  FileText,
  Briefcase,
  MessageSquare,
  User,
  Settings,
  X,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard,
  Search,
  FileText,
  Briefcase,
  MessageSquare,
  User,
};

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentSidebar({ isOpen, onClose }: StudentSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-[var(--color-border-subtle)]">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
            SkillBridge
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        </Link>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="md:hidden rounded-lg p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-[var(--color-text-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {Icon && <Icon size={18} />}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile at bottom */}
      <div className="border-t border-[var(--color-border-subtle)] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-semibold text-white flex-shrink-0">
            {studentProfile.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              {studentProfile.name}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] truncate">
              {studentProfile.major}
            </p>
          </div>
          <button
            className="rounded-lg p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)] transition-colors flex-shrink-0"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r border-[var(--color-border-subtle)] bg-white h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
