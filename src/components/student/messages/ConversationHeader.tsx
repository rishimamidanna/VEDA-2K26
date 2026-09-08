"use client";

import { ArrowLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";

const statusLabel: Record<Conversation["clientStatus"], string> = {
  online: "Online",
  offline: "Offline",
  away: "Away",
};

const statusColors: Record<Conversation["clientStatus"], string> = {
  online: "bg-emerald-500",
  offline: "bg-gray-300",
  away: "bg-yellow-400",
};

interface ConversationHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  onToggleDetails: () => void;
  showDetails: boolean;
}

export function ConversationHeader({ conversation, onBack, onToggleDetails, showDetails }: ConversationHeaderProps) {
  return (
    <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--color-border-subtle)] bg-white px-4 py-3.5 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Back button (mobile) */}
        <button
          onClick={onBack}
          className="flex items-center justify-center rounded-lg p-1.5 text-[var(--color-text-secondary)] hover:bg-gray-100 transition-colors lg:hidden"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
            {conversation.clientInitial}
          </div>
          <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white", statusColors[conversation.clientStatus])} />
        </div>

        {/* Info */}
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            {conversation.client}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {conversation.projectTitle}
          </p>
          <p className="text-[11px] font-medium" style={{ color: conversation.clientStatus === "online" ? "#10b981" : "#9ca3af" }}>
            {conversation.clientStatusText || statusLabel[conversation.clientStatus]}
          </p>
        </div>
      </div>

      <button
        onClick={onToggleDetails}
        className={cn(
          "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
          showDetails
            ? "bg-blue-50 text-blue-700"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)]"
        )}
      >
        <Info size={16} />
        <span className="hidden sm:inline">Project Details</span>
      </button>
    </div>
  );
}
