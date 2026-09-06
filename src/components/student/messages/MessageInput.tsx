"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageAttachment } from "@/types";

interface MessageInputProps {
  onSend: (content: string, attachment?: MessageAttachment) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;

    onSend(trimmed, attachment || undefined);
    setText("");
    setAttachment(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKB = file.size / 1024;
    const sizeMB = sizeKB / 1024;
    const size = sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
    setAttachment({ id: `att_${Date.now()}`, name: file.name, size });
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const canSend = text.trim().length > 0 || !!attachment;

  return (
    <div className="flex-shrink-0 border-t border-[var(--color-border-subtle)] bg-white p-4 sm:px-6">
      {/* Attachment preview */}
      {attachment && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-sm w-fit">
          <Paperclip size={14} className="text-blue-500" />
          <span className="font-medium text-blue-700">{attachment.name}</span>
          {attachment.size && <span className="text-blue-400">· {attachment.size}</span>}
          <button
            onClick={() => setAttachment(null)}
            className="ml-1 rounded-full text-blue-400 hover:text-blue-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-gray-100 transition-colors"
          title="Attach file"
        >
          <Paperclip size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Text input */}
        <div className="flex-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-gray-400"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all",
            canSend
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <Send size={18} />
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-gray-400 hidden sm:block">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
