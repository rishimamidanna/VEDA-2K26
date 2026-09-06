"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { StudentLayout } from "@/components/student/StudentLayout";
import {
  ConversationList,
  ConversationHeader,
  MessageList,
  MessageInput,
  ProjectContext,
} from "@/components/student/messages";
import { mockConversations, mockMessages } from "@/data/messages";
import type { Conversation, Message, MessageAttachment } from "@/types";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // On mobile: whether we're showing the chat pane (vs the list)
  const [showChat, setShowChat] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeConvId) ?? null;
  const activeMessages = activeConvId ? (messages[activeConvId] ?? []) : [];

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConvId(id);
    setShowChat(true);
    setShowDetails(false);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const handleBack = useCallback(() => {
    setShowChat(false);
    setShowDetails(false);
  }, []);

  const handleSend = useCallback(
    (content: string, attachment?: MessageAttachment) => {
      if (!activeConvId) return;

      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        conversationId: activeConvId,
        sender: "student",
        content,
        timestamp,
        status: "read",
        attachment,
      };

      setMessages((prev) => ({
        ...prev,
        [activeConvId]: [...(prev[activeConvId] ?? []), newMessage],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, lastMessage: content || attachment?.name || "", lastMessageAt: "just now" }
            : c
        )
      );
    },
    [activeConvId]
  );

  return (
    <StudentLayout title="Messages" fullWidth noPadding>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

        {/* ── COLUMN 1: Conversation List ── */}
        <div className={`
          flex-shrink-0 w-full sm:w-72 md:w-80
          ${showChat ? "hidden lg:flex" : "flex"}
          flex-col border-r border-[var(--color-border-subtle)]
        `}>
          <ConversationList
            conversations={conversations}
            activeId={activeConvId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelect={handleSelectConversation}
          />
        </div>

        {/* ── COLUMN 2 + 3 area ── */}
        <div className={`
          flex flex-1 min-w-0
          ${showChat ? "flex" : "hidden lg:flex"}
        `}>
          {activeConversation ? (
            <>
              {/* Chat area */}
              <div className="flex flex-1 min-w-0 flex-col">
                <ConversationHeader
                  conversation={activeConversation}
                  onBack={handleBack}
                  onToggleDetails={() => setShowDetails((v) => !v)}
                  showDetails={showDetails}
                />
                <MessageList messages={activeMessages} />
                <MessageInput onSend={handleSend} />
              </div>

              {/* Project Details Panel */}
              <ProjectContext
                conversation={activeConversation}
                isOpen={showDetails}
                onClose={() => setShowDetails(false)}
              />
            </>
          ) : (
            /* Empty state when no conversation is selected (desktop) */
            <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-canvas-surface)] border border-[var(--color-border-subtle)]">
                  <MessageSquare size={36} className="text-gray-300" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-[var(--color-text-primary)]">
                  Select a conversation
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
                  Choose a conversation from the left to read and reply to messages from your clients.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
