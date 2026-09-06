"use client";

import { motion } from "framer-motion";

export function DashboardPreview() {
  return (
    <div className="flex h-full w-full flex-col bg-[#F9FAFB] font-sans text-sm overflow-hidden relative">
      {/* Tiny top bar / Window controls */}
      <div className="flex h-10 w-full items-center border-b border-gray-200 bg-white px-4">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        </div>
        <div className="mx-auto flex h-6 w-1/3 items-center justify-center rounded-md bg-gray-100 text-[10px] text-gray-500 font-medium">
          skillbridge.app/dashboard
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden w-48 flex-col border-r border-gray-200 bg-white p-4 sm:flex">
          <div className="mb-6 text-sm font-semibold text-gray-900">SkillBridge</div>
          <nav className="flex flex-col gap-2">
            {["Dashboard", "Projects", "Messages", "Profile"].map((item, i) => (
              <div
                key={item}
                className={`flex h-8 items-center rounded-md px-3 text-xs font-medium ${
                  i === 1 ? "bg-gray-100 text-gray-900" : "text-gray-500"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recommended for you</h2>
          </div>

          {/* Continuous scrolling feed */}
          <div className="relative flex-1 overflow-hidden">
            <motion.div
              animate={{ y: [0, -400] }}
              transition={{
                repeat: Infinity,
                duration: 20,
                ease: "linear",
              }}
              className="flex flex-col gap-4 absolute w-full"
            >
              {/* Duplicate cards for infinite scroll illusion */}
              {[1, 2].map((group) => (
                <div key={group} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">AI Chatbot Development</h3>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                        95% Match
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">₹8,000 • 2 weeks</div>
                    <div className="mt-2 flex gap-2">
                      {["Python", "LLM", "FastAPI"].map((tag) => (
                        <span key={tag} className="rounded-md bg-gray-100 px-2 py-1 text-[10px] text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">Mobile App UI/UX Design</h3>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                        92% Match
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">₹5,000 • 3 weeks</div>
                    <div className="mt-2 flex gap-2">
                      {["Figma", "UI/UX", "Prototyping"].map((tag) => (
                        <span key={tag} className="rounded-md bg-gray-100 px-2 py-1 text-[10px] text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">Full Stack Web App</h3>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        85% Match
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">₹12,000 • 4 weeks</div>
                    <div className="mt-2 flex gap-2">
                      {["Next.js", "Tailwind", "PostgreSQL"].map((tag) => (
                        <span key={tag} className="rounded-md bg-gray-100 px-2 py-1 text-[10px] text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
