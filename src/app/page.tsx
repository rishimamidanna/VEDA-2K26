"use client";

import { BrandIntro, Navbar } from "@/components/layout";
import { Hero } from "@/components/sections/hero";

export default function Home() {
  return (
    <>
      <BrandIntro />
      <Navbar />
      <main className="flex min-h-screen flex-col bg-[var(--color-canvas-bg)] pt-16">
        <Hero />
      </main>
    </>
  );
}
