"use client";

import { motion } from "framer-motion";
import { Paperclip, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  index: number;
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isStudent = message.sender === "student";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn("flex w-full gap-2", isStudent ? "justify-end" : "justify-start")}
    >
      {/* Client avatar */}
      {!isStudent && (
        <div className="flex-shrink-0 self-end mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
            C
          </div>
        </div>
      )}

      <div className={cn("flex max-w-[75%] flex-col gap-1", isStudent ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isStudent
              ? "rounded-br-sm bg-blue-600 text-white"
              : "rounded-bl-sm bg-[var(--color-canvas-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]"
          )}
        >
          {message.content}

          {/* Attachment */}
          {message.attachment && (
            <div className={cn(
              "mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
              isStudent ? "bg-blue-700 text-blue-100" : "bg-white border border-[var(--color-border-subtle)] text-[var(--color-text-primary)]"
            )}>
              <Paperclip size={12} />
              <span>{message.attachment.name}</span>
              {message.attachment.size && (
                <span className="opacity-70">· {message.attachment.size}</span>
              )}
            </div>
          )}
        </div>

        {/* Timestamp + status */}
        <div className={cn("flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)]", isStudent ? "flex-row-reverse" : "flex-row")}>
          <span>{message.timestamp}</span>
          {isStudent && message.status === "read" && (
            <CheckCheck size={12} className="text-blue-500" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
