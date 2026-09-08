"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { ConversationSearch } from "./ConversationSearch";
import type { Conversation } from "@/types";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, activeId, searchQuery, onSearchChange, onSelect }: ConversationListProps) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.client.toLowerCase().includes(q) ||
        c.projectTitle.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  return (
    <div className="flex h-full flex-col border-r border-[var(--color-border-subtle)] bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[var(--color-border-subtle)] px-4 py-4">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Messages</h2>
      </div>

      {/* Search */}
      <div className="flex-shrink-0">
        <ConversationSearch value={searchQuery} onChange={onSearchChange} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <MessageSquare size={28} className="mb-3 text-gray-300" />
            {searchQuery ? (
              <>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">No conversations found</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Try a different search.</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">No conversations yet</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 mb-4">
                  Once you start working with a client, conversations will appear here.
                </p>
                <Link
                  href="/student/projects"
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Find Projects <ArrowRight size={12} />
                </Link>
              </>
            )}
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
