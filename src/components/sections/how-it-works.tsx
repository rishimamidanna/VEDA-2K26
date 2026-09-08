"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/layout";

export const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "Discover Projects",
    description: "Explore opportunities based on your interests and skills.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    )
  },
  {
    number: "02",
    title: "Match Your Skills",
    description: "Find projects aligned with what you already know and want to learn.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    )
  },
  {
    number: "03",
    title: "Work With Clients",
    description: "Collaborate on real requirements, milestones, and deliverables.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    )
  },
  {
    number: "04",
    title: "Build Your Portfolio",
    description: "Turn completed projects into proof of practical experience.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    )
  }
];

export function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section id="how-it-works" className="relative w-full border-t border-[#14141e]/[0.06] bg-white pt-6 pb-16 sm:pt-7 sm:pb-24 lg:pt-8 lg:pb-28 overflow-hidden z-20">
      <Container size="xl">
        <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
          <motion.span 
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: reduced ? 0 : 0.45 }}
            className="text-[11px] sm:text-[12px] font-semibold tracking-[0.2em] text-[#5c5c62] uppercase mb-3.5"
          >
            How It Works
          </motion.span>
          <motion.h2 
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.08 }}
            className="text-3xl sm:text-4xl lg:text-[40px] font-semibold text-[#1c1c1e] tracking-tight leading-tight mb-4"
          >
            From skills to real experience.
          </motion.h2>
          <motion.p 
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.16 }}
            className="text-base sm:text-lg text-[#48484a] max-w-2xl leading-relaxed"
          >
            SkillBridge helps students discover relevant projects, connect with clients, complete real work, and build a stronger portfolio.
          </motion.p>
        </div>

        <div className="relative">
          {/* Subtle horizontal connecting line on desktop - centered to icon box */}
          <div className="hidden lg:block absolute top-[24px] left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#14141e]/[0.08] to-transparent z-0" aria-hidden="true" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 relative z-10">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : 0.1 + index * 0.08 }}
                className="flex flex-col relative"
              >
                {/* Mobile vertical line connecting steps */}
                {index !== HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="block lg:hidden absolute top-12 bottom-0 left-[24px] w-[1px] bg-[#14141e]/[0.08] -z-10" aria-hidden="true" />
                )}

                <div className="flex flex-col">
                  <div className="flex items-center gap-3.5 mb-4 lg:mb-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#14141e]/[0.08] text-[#1c1c1e] shadow-[0_2px_6px_rgba(20,20,35,0.04)] relative z-10">
                      {step.icon}
                    </div>
                    <span className="text-[13px] font-semibold bg-gradient-to-r from-[#5a6ef5] to-[#9c71f7] bg-clip-text text-transparent tracking-widest">
                      {step.number}
                    </span>
                  </div>
                  
                  <h3 className="text-[16.5px] sm:text-[17px] font-semibold text-[#1c1c1e] mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-[13.5px] sm:text-[14px] text-[#5c5c62] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
