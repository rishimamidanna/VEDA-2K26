"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import type { StudentProfile, PortfolioProject } from "@/types";

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSave: (p: StudentProfile) => void;
}) {
  const [formData, setFormData] = useState({ ...profile });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-6 py-4 flex-shrink-0">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                Edit Profile
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[var(--color-text-secondary)] hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6 flex-1">
              <form id="edit-profile-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text-primary)]">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text-primary)]">Headline</label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text-primary)]">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text-primary)]">Availability</label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text-primary)]">About</label>
                  <textarea
                    rows={5}
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border-subtle)] bg-white px-6 py-4 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-profile-form"
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function AddPortfolioModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (p: PortfolioProject) => void;
}) {
  const [formData, setFormData] = useState<Partial<PortfolioProject>>({
    title: "",
    description: "",
    technologies: [],
    projectType: "Personal Project",
    githubUrl: "",
    demoUrl: "",
  });
  
  const [techInput, setTechInput] = useState("");

  const handleAddTech = () => {
    if (techInput.trim() && !formData.technologies?.includes(techInput.trim())) {
      setFormData({ ...formData, technologies: [...(formData.technologies || []), techInput.trim()] });
      setTechInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    onAdd({
      id: `port_${Date.now()}`,
      title: formData.title,
      description: formData.description || "",
      technologies: formData.technologies || [],
      projectType: formData.projectType || "Personal Project",
      githubUrl: formData.githubUrl,
      demoUrl: formData.demoUrl,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] px-6 py-4 flex-shrink-0">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                Add Project
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[var(--color-text-secondary)] hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6 flex-1">
              <form id="add-project-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text-primary)]">Project Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text-primary)]">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text-primary)]">Technologies</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); } }}
                      placeholder="e.g. React"
                      className="flex-1 rounded-xl border border-[var(--color-border-subtle)] p-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button type="button" onClick={handleAddTech} className="rounded-xl bg-[var(--color-canvas-surface)] px-4 text-sm font-semibold border border-[var(--color-border-subtle)]">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.technologies?.map((tech) => (
                      <span key={tech} className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {tech}
                        <button type="button" onClick={() => setFormData({ ...formData, technologies: formData.technologies?.filter(t => t !== tech) })}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text-primary)]">Project Type</label>
                  <input
                    type="text"
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text-primary)]">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border-subtle)] bg-white px-6 py-4 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-canvas-surface)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-project-form"
                disabled={!formData.title}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Add Project
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ShareProfileModal({ isOpen, onClose, username }: { isOpen: boolean; onClose: () => void; username: string }) {
  const [copied, setCopied] = useState(false);
  
  // mock link
  const link = `https://skillbridge.dev/student/profile/${username.toLowerCase().replace(/\s+/g, '-')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Share Profile</h2>
              <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              Anyone with this link can view your public profile.
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas-surface)] p-2">
              <input 
                readOnly 
                value={link} 
                className="flex-1 bg-transparent px-2 text-sm text-[var(--color-text-primary)] outline-none"
              />
              <button 
                onClick={handleCopy}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-gray-50"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
