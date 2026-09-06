"use client";

import { motion } from "framer-motion";
import { Code2, PenTool, TrendingUp, CheckCircle2 } from "lucide-react";

export function FloatingCards() {
  return (
    <>
      {/* React Developer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -20, y: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute -left-12 top-10 z-20 hidden lg:block"
      >
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-white/90 p-4 shadow-xl backdrop-blur-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Code2 size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">React Developer</p>
            <p className="text-[10px] text-gray-500">New opportunity</p>
          </div>
        </motion.div>
      </motion.div>

      {/* UI/UX Designer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute -right-8 top-32 z-20 hidden lg:block"
      >
        <motion.div
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-white/90 p-4 shadow-xl backdrop-blur-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <PenTool size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">UI/UX Designer</p>
            <p className="text-[10px] text-gray-500">Hiring now</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Grow your portfolio */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="absolute -left-8 bottom-32 z-20 hidden md:block"
      >
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-white/90 p-4 shadow-xl backdrop-blur-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">Grow Portfolio</p>
            <p className="text-[10px] text-gray-500">Real experience</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Project Completed */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 20, y: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="absolute -right-4 bottom-16 z-20 hidden md:block"
      >
        <motion.div
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-white/90 p-4 shadow-xl backdrop-blur-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">Project Completed</p>
            <p className="text-[10px] text-gray-500">Payment secured</p>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
