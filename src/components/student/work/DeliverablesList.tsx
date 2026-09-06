"use client";

import { Check, Circle } from "lucide-react";
import type { Deliverable } from "@/types";

export function DeliverablesList({ deliverables }: { deliverables: Deliverable[] }) {
  if (deliverables.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
        Deliverables
      </h3>
      <div className="flex flex-col gap-2">
        {deliverables.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {item.status === "Completed" ? (
              <Check size={16} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle size={16} className="text-gray-300 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${item.status === "Completed" ? "text-[var(--color-text-primary)] line-through opacity-70" : "text-[var(--color-text-primary)]"}`}>
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
