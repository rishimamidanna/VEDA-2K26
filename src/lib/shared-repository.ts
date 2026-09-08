"use client";

import { useEffect, useState } from "react";
import { Project, Application, WorkProject, StudentProfile, Role } from "@/types";

// Seeded Data
import { allProjects as SEEDED_PROJECTS } from "@/data/projects";
import { allApplications as SEEDED_APPLICATIONS } from "@/data/applications";
import { allWorkProjects as SEEDED_WORK } from "@/data/work";

const PROJECTS_KEY = "skillbridge_shared_projects";
const APPLICATIONS_KEY = "skillbridge_shared_applications";
const WORK_KEY = "skillbridge_shared_work";

// --- REPOSITORY FUNCTIONS (Can be used anywhere, but beware of SSR) ---

export const sharedRepository = {
  getProjects(): Project[] {
    if (typeof window === "undefined") return SEEDED_PROJECTS;
    try {
      const stored = localStorage.getItem(PROJECTS_KEY);
      if (!stored) {
        // Initialize with seeded data
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(SEEDED_PROJECTS));
        return SEEDED_PROJECTS;
      }
      return JSON.parse(stored);
    } catch {
      return SEEDED_PROJECTS;
    }
  },

  saveProject(project: Project) {
    if (typeof window === "undefined") return;
    const projects = this.getProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.unshift(project);
    }
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    window.dispatchEvent(new Event("skillbridge_data_updated"));
  },

  getApplications(): Application[] {
    if (typeof window === "undefined") return SEEDED_APPLICATIONS;
    try {
      const stored = localStorage.getItem(APPLICATIONS_KEY);
      if (!stored) {
        localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(SEEDED_APPLICATIONS));
        return SEEDED_APPLICATIONS;
      }
      return JSON.parse(stored);
    } catch {
      return SEEDED_APPLICATIONS;
    }
  },

  saveApplication(application: Application) {
    if (typeof window === "undefined") return;
    const apps = this.getApplications();
    const existingIndex = apps.findIndex((a) => a.id === application.id);
    if (existingIndex >= 0) {
      apps[existingIndex] = application;
    } else {
      apps.unshift(application);
    }
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    window.dispatchEvent(new Event("skillbridge_data_updated"));
  },

  getWorkProjects(): WorkProject[] {
    if (typeof window === "undefined") return SEEDED_WORK;
    try {
      const stored = localStorage.getItem(WORK_KEY);
      if (!stored) {
        localStorage.setItem(WORK_KEY, JSON.stringify(SEEDED_WORK));
        return SEEDED_WORK;
      }
      return JSON.parse(stored);
    } catch {
      return SEEDED_WORK;
    }
  },
  
  saveWorkProject(work: WorkProject) {
    if (typeof window === "undefined") return;
    const works = this.getWorkProjects();
    const existingIndex = works.findIndex((w) => w.id === work.id);
    if (existingIndex >= 0) {
      works[existingIndex] = work;
    } else {
      works.unshift(work);
    }
    localStorage.setItem(WORK_KEY, JSON.stringify(works));
    window.dispatchEvent(new Event("skillbridge_data_updated"));
  }
};

// --- REACT HOOKS FOR SAFE UI BINDING ---

export function useSharedProjects() {
  const [projects, setProjects] = useState<Project[]>(SEEDED_PROJECTS);

  useEffect(() => {
    setProjects(sharedRepository.getProjects());

    const handleUpdate = () => setProjects(sharedRepository.getProjects());
    window.addEventListener("skillbridge_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    
    return () => {
      window.removeEventListener("skillbridge_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return projects;
}

export function useSharedApplications() {
  const [apps, setApps] = useState<Application[]>(SEEDED_APPLICATIONS);

  useEffect(() => {
    setApps(sharedRepository.getApplications());

    const handleUpdate = () => setApps(sharedRepository.getApplications());
    window.addEventListener("skillbridge_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    
    return () => {
      window.removeEventListener("skillbridge_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return apps;
}

export function useSharedWorkProjects() {
  const [work, setWork] = useState<WorkProject[]>(SEEDED_WORK);

  useEffect(() => {
    setWork(sharedRepository.getWorkProjects());

    const handleUpdate = () => setWork(sharedRepository.getWorkProjects());
    window.addEventListener("skillbridge_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    
    return () => {
      window.removeEventListener("skillbridge_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return work;
}
