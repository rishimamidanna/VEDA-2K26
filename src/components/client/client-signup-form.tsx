"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useClientAuth } from "@/components/client/client-auth-context";

function SignupFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useClientAuth();

  const from = searchParams.get("from") || "/client/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(cleanName, cleanEmail, company.trim());
      router.push(from.startsWith("/client") ? from : "/client/dashboard");
    } catch {
      setError("Failed to create client account. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand & Eyebrow */}
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 group focus-visible:outline-hidden"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-text-primary)] text-white shadow-xs transition-transform group-hover:scale-105">
            <span className="text-[14px] font-bold">SB</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            SkillBridge
          </span>
        </Link>

        <div className="pt-2">
          <span className="inline-flex items-center rounded-full bg-[#0071e3]/10 px-3 py-1 text-[11px] font-semibold text-[#0071e3] uppercase tracking-wider">
            Client Portal &bull; Role: Client
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Create Client Account
          </h1>
          <p className="mt-1 text-[14px] text-[var(--color-text-secondary)]">
            Post projects and connect directly with verified student freelancers.
          </p>
        </div>
      </div>

      {/* Main Signup Form Card */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-6 sm:p-8 shadow-2xs space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-[13px] text-red-700 font-medium flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-800 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="client-name"
              className="block text-[13px] font-semibold text-[var(--color-text-primary)]"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="client-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Rishi Mamidanna"
              autoComplete="name"
              className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-4 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="client-email"
              className="block text-[13px] font-semibold text-[var(--color-text-primary)]"
            >
              Work / Client Email <span className="text-red-500">*</span>
            </label>
            <input
              id="client-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. client@company.com"
              autoComplete="email"
              className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-4 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="client-company"
              className="block text-[13px] font-semibold text-[var(--color-text-primary)]"
            >
              Company / Organization <span className="text-[11px] font-normal text-[var(--color-text-tertiary)]">(Optional)</span>
            </label>
            <input
              id="client-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Labs or Independent"
              autoComplete="organization"
              className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-4 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="client-password"
              className="block text-[13px] font-semibold text-[var(--color-text-primary)]"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="client-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-4 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all"
            />
          </div>

          <div className="rounded-xl bg-[var(--color-canvas-surface)] p-3 text-[12px] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
            By creating a client account, your role will be stored as <span className="font-semibold text-[var(--color-text-primary)]">Client</span> to post projects and hire students.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-text-primary)] px-6 text-[14px] font-medium text-white shadow-xs transition-all hover:bg-black hover:shadow-sm active:scale-[0.98] disabled:opacity-60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Client Account</span>
            )}
          </button>
        </form>
      </div>

      {/* Switch to Login */}
      <div className="text-center text-[13px] text-[var(--color-text-secondary)]">
        Already have a client account?{" "}
        <Link
          href={`/client/login${from !== "/client/dashboard" ? `?from=${encodeURIComponent(from)}` : ""}`}
          className="font-semibold text-[#0071e3] hover:underline"
        >
          Sign in
        </Link>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          &larr; Back to SkillBridge Home
        </Link>
      </div>
    </div>
  );
}

export function ClientSignupForm() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-text-primary)] border-t-transparent" />
        </div>
      }
    >
      <SignupFormInner />
    </Suspense>
  );
}
