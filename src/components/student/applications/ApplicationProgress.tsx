"use client";

import { CheckCircle2, Circle } from "lucide-react";
import type { ApplicationStatus } from "@/types";

interface ApplicationProgressProps {
  status: ApplicationStatus;
}

const workflow = ["Applied", "Shortlisted", "Accepted", "In Progress", "Completed"];

export function ApplicationProgress({ status }: ApplicationProgressProps) {
  if (status === "Rejected") return null;

  const currentStepIndex =
    status === "Accepted" ? 2 :
    status === "Shortlisted" ? 1 :
    0; // Pending implies just Applied

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
      {workflow.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isLastCompleted = index === currentStepIndex;
        
        return (
          <div key={step} className="flex items-center gap-1 sm:gap-2">
            {isCompleted ? (
              <CheckCircle2 size={14} className={isLastCompleted ? "text-blue-600" : "text-emerald-500"} />
            ) : (
              <Circle size={14} className="text-gray-300" />
            )}
            <span
              className={`text-[10px] sm:text-xs font-medium ${
                isLastCompleted
                  ? "text-blue-700"
                  : isCompleted
                  ? "text-emerald-700"
                  : "text-gray-400"
              }`}
            >
              {step}
            </span>
            {index < workflow.length - 1 && (
              <div className="ml-1 sm:ml-2 h-px w-2 sm:w-4 bg-[var(--color-border-subtle)]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
