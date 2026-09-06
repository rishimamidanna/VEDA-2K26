import {
  ClientProjectDetail,
  ProjectStatus,
  SEEDED_PROJECT_DETAILS,
} from "@/data/client-projects";

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

export interface ClientProjectItem extends ClientProjectDetail {
  isUserCreated?: boolean;
}

const STORAGE_KEY = "skillbridge_client_created_projects";

/**
 * Clean repository service for prototype client projects.
 * Keeps storage logic isolated from UI components so a real backend / database
 * can replace this service without rewriting UI logic.
 */
export const clientProjectsRepository = {
  /**
   * Returns all user-created projects stored in localStorage.
   */
  getUserProjects(): ClientProjectItem[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Returns all projects for a specific client (or all if no clientId provided),
   * combining user-created projects with seeded demo projects.
   * User-created projects appear at the top.
   */
  getAllProjects(clientId?: string): ClientProjectItem[] {
    const userProjects = this.getUserProjects();
    const seededList: ClientProjectItem[] = Object.values(SEEDED_PROJECT_DETAILS).map(
      (proj) => ({
        ...proj,
        isUserCreated: false,
      })
    );

    // If clientId is provided, filter user projects by that clientId.
    const filteredUserProjects = clientId
      ? userProjects.filter((p) => p.clientId === clientId)
      : userProjects;

    return [...filteredUserProjects, ...seededList];
  },

  /**
   * Look up a project by its unique ID (checks user projects first, then seeded projects).
   */
  getProjectById(id: string): ClientProjectItem | null {
    const userProjects = this.getUserProjects();
    const match = userProjects.find((p) => p.id === id);
    if (match) return match;

    const seeded = SEEDED_PROJECT_DETAILS[id];
    if (seeded) {
      return {
        ...seeded,
        isUserCreated: false,
      };
    }

    return null;
  },

  /**
   * Create and persist a new project for the client.
   * Sets default status to "Open", initial applicantsCount to 0,
   * generates safe unique id, and timestamps creation.
   */
  createProject(input: CreateProjectInput): ClientProjectItem {
    const uniqueId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Format postedDate nicely e.g. "Sep 6, 2026"
    const now = new Date();
    const postedDate = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const formattedBudget = input.budget.startsWith("₹")
      ? input.budget
      : `₹${Number(input.budget).toLocaleString("en-IN")}`;

    const newProject: ClientProjectItem = {
      id: uniqueId,
      clientId: input.clientId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      skills: input.skills,
      budget: formattedBudget,
      duration: input.duration,
      experienceLevel: input.experienceLevel,
      deliverables: input.deliverables,
      deadline: input.deadline ? input.deadline : undefined,
      status: "Open" as ProjectStatus,
      postedDate,
      createdAt: now.toISOString(),
      applicantsCount: 0,
      isUserCreated: true,
      timelineNote: "Project published and actively open for student proposals.",
    };

    if (typeof window !== "undefined") {
      try {
        const existing = this.getUserProjects();
        const updated = [newProject, ...existing];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        // Dispatch custom event so listeners on the same tab can update reactively
        window.dispatchEvent(new Event("skillbridge_projects_updated"));
      } catch (err) {
        console.error("Failed to save project to localStorage:", err);
      }
    }

    return newProject;
  },
};
