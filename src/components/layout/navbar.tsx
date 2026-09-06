"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Container } from "./container";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Find Projects", href: "#projects" },
    { name: "Find Talent", href: "#talent" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "About", href: "#about" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-canvas-bg)]/80 backdrop-blur-md border-b border-[var(--color-border-subtle)]"
    >
      <Container size="xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              SkillBridge
            </span>
            <span className="h-2 w-2 rounded-full bg-blue-500" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 border-l border-[var(--color-border-subtle)] pl-6">
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--color-text-primary)] hover:text-blue-500 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[var(--color-text-primary)] px-4 py-2 text-sm font-medium text-[var(--color-canvas-bg)] hover:bg-[var(--color-text-secondary)] transition-colors"
              >
                Get Started
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-[var(--color-text-primary)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </Container>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--color-border-subtle)] bg-[var(--color-canvas-bg)] overflow-hidden"
          >
            <Container size="sm" className="py-4">
              <ul className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="block text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-4 mt-2 border-t border-[var(--color-border-subtle)] flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="block text-center rounded-full border border-[var(--color-border-subtle)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-subtle)] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="block text-center rounded-full bg-[var(--color-text-primary)] px-4 py-2 text-sm font-medium text-[var(--color-canvas-bg)] hover:bg-[var(--color-text-secondary)] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
