import { Project, ProjectStatus } from "@/types";
import { sharedRepository } from "./shared-repository";

export interface CreateProjectInput {
  clientId: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: string;
  duration: string;
  experienceLevel: string;
  deliverables: string[];
  deadline?: string;
}

export type ClientProjectItem = Project;

export const clientProjectsRepository = {
  getUserProjects(): ClientProjectItem[] {
    return sharedRepository.getProjects().filter(p => p.isUserCreated);
  },

  getAllProjects(clientId?: string): ClientProjectItem[] {
    const all = sharedRepository.getProjects();
    if (clientId) {
      return all.filter(p => p.clientId === clientId || !p.isUserCreated);
    }
    return all;
  },

  getProjectById(id: string): ClientProjectItem | null {
    return sharedRepository.getProjects().find(p => p.id === id) || null;
  },

  createProject(input: CreateProjectInput, userId: string = "client_123"): ClientProjectItem {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      clientId: userId,
      title: input.title,
      description: input.description,
      category: input.category,
      skills: input.skills,
      budget: input.budget,
      duration: input.duration,
      experienceLevel: input.experienceLevel,
      deliverables: input.deliverables,
      deadline: input.deadline,
      status: "Open",
      postedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      applicantsCount: 0,
      isUserCreated: true,
    };
    sharedRepository.saveProject(newProject);
    return newProject;
  },

  updateProjectStatus(projectId: string, status: ProjectStatus): ClientProjectItem | null {
    const all = sharedRepository.getProjects();
    const proj = all.find(p => p.id === projectId);
    if (proj) {
      proj.status = status as any;
      sharedRepository.saveProject(proj);
      return proj;
    }
    return null;
  }
};

