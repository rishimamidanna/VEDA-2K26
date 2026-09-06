"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Container } from "./container";
import { cn } from "@/lib/utils";
import { useIntroPhase } from "@/components/intro";

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Find Projects", href: "#projects" },
  { label: "Find Talent", href: "#talent" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

export interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const phase = useIntroPhase();
  const isRevealed = phase !== "playing";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Monitor scroll state for enhanced elevation on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Return null if on client dashboard routes so it uses its own dedicated shell
  if (pathname?.startsWith("/client")) {
    return null;
  }

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -6 }}
      animate={
        isRevealed
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: reduced ? 0 : -6 }
      }
      transition={{
        duration: reduced ? 0.35 : 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 motion-reduce:transition-none",
        "bg-[var(--color-canvas-bg)]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--color-canvas-bg)]/75",
        isScrolled
          ? "border-b border-[var(--color-border-subtle)] shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          : "border-b border-transparent",
        className
      )}
    >
      <Container size="xl">
        <div className="flex h-16 sm:h-[68px] items-center justify-between">
          {/* Left: Wordmark */}
          <div className="flex items-center">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded-md py-1"
              aria-label="SkillBridge Home"
              onClick={closeMobileMenu}
            >
              <span className="text-xl sm:text-[22px] font-semibold tracking-tight text-[var(--color-text-primary)] transition-colors duration-200 group-hover:text-black">
                SkillBridge
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] opacity-85 transition-transform duration-300 motion-safe:group-hover:scale-125" />
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-7 lg:gap-9"
            aria-label="Desktop Primary Navigation"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[14px] font-medium text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-text-primary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded-md px-1.5 py-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <Link
              href="#login"
              className="text-[14px] font-medium text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-text-primary)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded-full px-4 py-2 motion-safe:active:scale-[0.99]"
            >
              Log in
            </Link>

            <Link
              href="#get-started"
              className="group inline-flex items-center gap-1.5 rounded-full bg-[var(--color-text-primary)] px-4.5 py-2 text-[14px] font-medium text-white shadow-xs transition-all duration-200 motion-reduce:transition-none hover:bg-black hover:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
            >
              <span>Get Started</span>
              <span className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>

          {/* Mobile: Hamburger / Close Trigger */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-primary)] transition-colors hover:bg-black/5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] motion-safe:active:scale-95"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <div className="relative h-4 w-5">
                <span
                  className={cn(
                    "absolute left-0 top-0 h-0.5 w-5 rounded-full bg-[var(--color-text-primary)] transition-all duration-300 motion-reduce:transition-none ease-out",
                    isMobileMenuOpen ? "top-2 rotate-45" : "top-0.5"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-2 h-0.5 w-5 rounded-full bg-[var(--color-text-primary)] transition-all duration-200 motion-reduce:transition-none ease-out",
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 bottom-0 h-0.5 w-5 rounded-full bg-[var(--color-text-primary)] transition-all duration-300 motion-reduce:transition-none ease-out",
                    isMobileMenuOpen ? "bottom-1.5 -rotate-45" : "bottom-0.5"
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Navigation Drawer / Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-navigation-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduced ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] md:hidden shadow-lg"
          >
            <Container size="xl" className="py-6">
              <nav
                className="flex flex-col space-y-1"
                aria-label="Mobile Primary Navigation"
              >
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="flex h-12 items-center rounded-lg px-3 text-[16px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-black/5 active:bg-black/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="my-5 h-px w-full bg-[var(--color-border-subtle)]" />

              <div className="flex flex-col gap-3">
                <Link
                  href="#login"
                  onClick={closeMobileMenu}
                  className="flex h-12 w-full items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white text-[15px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-canvas-surface)] motion-safe:active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  Log in
                </Link>

                <Link
                  href="#get-started"
                  onClick={closeMobileMenu}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-text-primary)] text-[15px] font-medium text-white shadow-xs transition-colors hover:bg-black motion-safe:active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  <span>Get Started</span>
                  <span>→</span>
                </Link>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
