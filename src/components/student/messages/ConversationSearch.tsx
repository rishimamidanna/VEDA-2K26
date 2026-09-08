"use client";

import { Search } from "lucide-react";

interface ConversationSearchProps {
  value: string;
  onChange: (v: string) => void;
}

export function ConversationSearch({ value, onChange }: ConversationSearchProps) {
  return (
    <div className="relative px-4 py-3 border-b border-[var(--color-border-subtle)]">
      <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search conversations..."
        className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] py-2 pl-8 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
      />
    </div>
  );
}
