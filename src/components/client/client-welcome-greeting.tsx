"use client";

import React from "react";
import { useClientAuth } from "./client-auth-context";

export function ClientWelcomeGreeting() {
  const { user } = useClientAuth();

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-1">
      <h1
        id="dashboard-heading"
        className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]"
      >
        Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
      </h1>
      <p className="text-[14px] sm:text-[15px] text-[var(--color-text-secondary)]">
        Manage your projects and connect with talented students.
      </p>
    </section>
  );
}
