"use client";

import { Bell, Search, Menu } from "lucide-react";
import { studentProfile } from "@/data/student";

interface StudentHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function StudentHeader({ title, onMenuClick }: StudentHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border-subtle)] bg-white/80 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)] transition-colors md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h1>
      </div>

      {/* Right: Search + Notifications + Avatar */}
      <div className="flex items-center gap-2">
        <button
          className="hidden sm:flex items-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] transition-colors"
          aria-label="Search"
        >
          <Search size={15} />
          <span>Search...</span>
        </button>
        {/* Mobile search icon only */}
        <button
          className="sm:hidden rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        <button
          className="relative rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-semibold text-white ml-1">
          {studentProfile.avatar}
        </div>
      </div>
    </header>
  );
}
