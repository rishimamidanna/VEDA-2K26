"use client";

import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const statusColors: Record<Conversation["clientStatus"], string> = {
  online: "bg-emerald-500",
  offline: "bg-gray-300",
  away: "bg-yellow-400",
};

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const isUnread = conversation.unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-4 flex items-start gap-3 transition-colors border-b border-[var(--color-border-subtle)] last:border-b-0",
        isActive
          ? "bg-blue-50 border-l-2 border-l-blue-600"
          : "hover:bg-[var(--color-canvas-surface)]"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
          {conversation.clientInitial}
        </div>
        <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white", statusColors[conversation.clientStatus])} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={cn("truncate text-sm", isUnread ? "font-bold text-[var(--color-text-primary)]" : "font-semibold text-[var(--color-text-primary)]")}>
            {conversation.client}
          </span>
          <span className="flex-shrink-0 text-[11px] text-[var(--color-text-secondary)]">
            {conversation.lastMessageAt}
          </span>
        </div>
        <p className="mb-1 truncate text-xs font-medium text-blue-600">
          {conversation.projectTitle}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className={cn("truncate text-xs", isUnread ? "font-medium text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]")}>
            {conversation.lastMessage}
          </p>
          {isUnread && (
            <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
