"use client";

import { MessageSquare, Upload, Flag } from "lucide-react";
import type { Activity } from "@/types";

export function RecentActivity({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
        Recent Activity
      </h3>
      <div className="flex flex-col gap-4 border-l-2 border-[var(--color-border-subtle)] ml-2 pl-4">
        {activities.map((activity) => (
          <div key={activity.id} className="relative">
            <div className="absolute -left-[25px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[var(--color-canvas-surface)] text-[var(--color-text-secondary)]">
              {activity.type === "note" ? <MessageSquare size={12} /> :
               activity.type === "upload" ? <Upload size={12} /> :
               <Flag size={12} />}
            </div>
            <p className="text-sm text-[var(--color-text-primary)] font-medium">
              {activity.content}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {activity.timestamp}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClientNotes({ notes }: { notes?: string }) {
  if (!notes) return null;

  return (
    <div className="mb-8 rounded-xl bg-yellow-50 p-4 border border-yellow-100">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-yellow-800">
        Client Notes
      </h3>
      <p className="text-sm italic text-yellow-900 leading-relaxed">
        &quot;{notes}&quot;
      </p>
    </div>
  );
}
