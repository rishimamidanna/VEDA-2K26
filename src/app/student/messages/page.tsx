"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { StudentLayout } from "@/components/student/StudentLayout";
import {
  ConversationList,
  ConversationHeader,
  MessageList,
  MessageInput,
  ProjectContext,
} from "@/components/student/messages";
import { apiClient, ApiClientError } from "@/lib/api-client";
import type { Conversation, Message } from "@/types";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(null);

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeConvDetail, setActiveConvDetail] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 1. Fetch all conversations for the authenticated student
  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingConversations(true);
    try {
      setConversationsError(null);
      const data = await apiClient.get<Conversation[]>("/api/conversations");
      setConversations(data);
    } catch (err: any) {
      if (!silent) {
        setConversationsError(err?.message || "Failed to load conversations");
      }
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Fetch messages for the active conversation
  const fetchMessages = useCallback(async (convId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      setMessagesError(null);
      const [msgs, detail] = await Promise.all([
        apiClient.get<Message[]>(`/api/conversations/${convId}/messages`),
        apiClient.get<Conversation>(`/api/conversations/${convId}`).catch(() => null),
      ]);

      setMessages((prev) => ({
        ...prev,
        [convId]: msgs,
      }));

      if (detail) {
        setActiveConvDetail(detail);
      }
    } catch (err: any) {
      if (!silent) {
        setMessagesError(err?.message || "Failed to load messages");
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  // 3. Mark conversation as read
  const markAsRead = useCallback(async (convId: string) => {
    try {
      await apiClient.patch(`/api/conversations/${convId}/read`);
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      // Non-critical, ignore silent failure
    }
  }, []);

  // 4. Select a conversation
  const handleSelectConversation = useCallback(
    (id: string) => {
      setActiveConvId(id);
      setShowChat(true);
      setShowDetails(false);
      fetchMessages(id);
      markAsRead(id);
    },
    [fetchMessages, markAsRead]
  );

  // 5. Polling for updates on active conversation (every 4 seconds)
  useEffect(() => {
    if (!activeConvId) return;

    const interval = setInterval(() => {
      fetchMessages(activeConvId, true);
      fetchConversations(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConvId, fetchMessages, fetchConversations]);

  const handleBack = useCallback(() => {
    setShowChat(false);
    setShowDetails(false);
  }, []);

  // 6. Send message with real file attachment upload
  const handleSend = useCallback(
    async (content: string, file?: File | null): Promise<boolean> => {
      if (!activeConvId) return false;

      setIsSending(true);
      try {
        let uploadRes: any = null;

        // If file attachment exists, upload first via existing /api/files/upload
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("category", "MESSAGE_ATTACHMENT");
          formData.append("contextId", activeConvId);

          uploadRes = await apiClient.upload<any>("/api/files/upload", formData);
        }

        const payload: any = { content: content || "" };
        if (uploadRes) {
          payload.attachmentName = uploadRes.originalName || file?.name;
          const sizeBytes = uploadRes.size || file?.size;
          if (sizeBytes) {
            const kb = sizeBytes / 1024;
            payload.attachmentSize =
              kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
          }
          payload.attachmentUrl = `/api/files/${uploadRes.id}/download?redirect=true`;
        }

        const createdMessage = await apiClient.post<Message>(
          `/api/conversations/${activeConvId}/messages`,
          payload
        );

        // Append returned database message to local state
        setMessages((prev) => ({
          ...prev,
          [activeConvId]: [...(prev[activeConvId] ?? []), createdMessage],
        }));

        // Update preview in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  lastMessage: content || uploadRes?.originalName || file?.name || "Attachment",
                  lastMessageAt: "just now",
                }
              : c
          )
        );

        return true;
      } catch (err: any) {
        alert(err?.message || "Failed to send message. Please try again.");
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [activeConvId]
  );

  const activeConversation =
    activeConvDetail || conversations.find((c) => c.id === activeConvId) || null;
  const activeMessages = activeConvId ? (messages[activeConvId] ?? []) : [];

  return (
    <StudentLayout title="Messages" fullWidth noPadding>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* ── COLUMN 1: Conversation List ── */}
        <div
          className={`
          flex-shrink-0 w-full sm:w-72 md:w-80
          ${showChat ? "hidden lg:flex" : "flex"}
          flex-col border-r border-[var(--color-border-subtle)] bg-white
        `}
        >
          {loadingConversations ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
              <p className="text-xs text-[var(--color-text-secondary)]">Loading conversations...</p>
            </div>
          ) : conversationsError ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Failed to load conversations
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 mb-4">
                {conversationsError}
              </p>
              <button
                onClick={() => fetchConversations()}
                className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={activeConvId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelect={handleSelectConversation}
            />
          )}
        </div>

        {/* ── COLUMN 2 + 3 area ── */}
        <div
          className={`
          flex flex-1 min-w-0
          ${showChat ? "flex" : "hidden lg:flex"}
        `}
        >
          {activeConversation ? (
            <>
              {/* Chat area */}
              <div className="flex flex-1 min-w-0 flex-col bg-white">
                <ConversationHeader
                  conversation={activeConversation}
                  onBack={handleBack}
                  onToggleDetails={() => setShowDetails((v) => !v)}
                  showDetails={showDetails}
                />

                {loadingMessages && activeMessages.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
                    <p className="text-xs text-[var(--color-text-secondary)]">Loading messages...</p>
                  </div>
                ) : messagesError && activeMessages.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Failed to load messages
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 mb-4">
                      {messagesError}
                    </p>
                    <button
                      onClick={() => activeConvId && fetchMessages(activeConvId)}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <RefreshCw size={12} /> Retry
                    </button>
                  </div>
                ) : activeMessages.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                    <MessageSquare size={32} className="text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      No messages yet
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] max-w-xs mt-1">
                      Send a message below to coordinate on this project with your client.
                    </p>
                  </div>
                ) : (
                  <MessageList messages={activeMessages} />
                )}

                <MessageInput onSend={handleSend} disabled={isSending} />
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
