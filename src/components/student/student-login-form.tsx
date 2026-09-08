"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudentAuth, StudentAuthProvider } from "@/components/student/student-auth-context";

function StudentLoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useStudentAuth();

  const from = searchParams.get("from") || "/student";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your university or personal email.");
      return;
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(cleanEmail, password);
      router.push(from.startsWith("/student") ? from : "/student");
    } catch (err: any) {
      setError(err.message || "Unable to sign in. Please check credentials.");
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await login("alex.johnson@university.edu", "Student123!");
      router.push(from.startsWith("/student") ? from : "/student");
    } catch (err: any) {
      setError(err.message || "Unable to complete demo student sign in.");
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
          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            Student Portal &bull; Role: Student
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Sign in as Student
          </h1>
          <p className="mt-1 text-[14px] text-[var(--color-text-secondary)]">
            Discover real-world projects, submit proposals, and build your career.
          </p>
        </div>
      </div>

      {/* Main Login Form Card */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] p-6 sm:p-8 shadow-2xs space-y-5">
        {user && user.role === "student" && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 flex items-center justify-between gap-3 text-[13px]">
            <div className="flex items-center gap-2 truncate">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[var(--color-text-secondary)] truncate">
                Signed in as <strong className="font-semibold text-[var(--color-text-primary)]">{user.name || user.email}</strong>
              </span>
            </div>
            <Link
              href="/student"
              className="inline-flex h-8 items-center justify-center rounded-full bg-[var(--color-text-primary)] px-3.5 text-[12px] font-semibold text-white shadow-2xs hover:bg-black shrink-0 transition-all"
            >
              Continue &rarr;
            </Link>
          </div>
        )}

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
              htmlFor="student-email"
              className="block text-[13px] font-semibold text-[var(--color-text-primary)]"
            >
              Student Email
            </label>
            <input
              id="student-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. alex.johnson@university.edu"
              autoComplete="email"
              className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-4 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="student-password"
                className="block text-[13px] font-semibold text-[var(--color-text-primary)]"
              >
                Password
              </label>
            </div>
            <input
              id="student-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] px-4 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-text-primary)] px-6 text-[14px] font-medium text-white shadow-xs transition-all hover:bg-black hover:shadow-sm active:scale-[0.98] disabled:opacity-60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In as Student</span>
            )}
          </button>
        </form>

        {/* 1-Click Fast Demo Fill */}
        <div className="pt-4 border-t border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={isSubmitting}
            className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-4 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-white hover:border-[var(--color-border-hover)] transition-all"
          >
            <span>⚡ Instant Demo Student Sign In</span>
          </button>
        </div>
      </div>

      {/* Switch to Signup */}
      <div className="text-center text-[13px] text-[var(--color-text-secondary)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/client/signup"
          className="font-semibold text-blue-600 hover:underline"
        >
          Sign up
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

export function StudentLoginForm() {
  return (
    <StudentAuthProvider>
      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-text-primary)] border-t-transparent" />
          </div>
        }
      >
        <StudentLoginFormInner />
      </Suspense>
    </StudentAuthProvider>
  );
}
