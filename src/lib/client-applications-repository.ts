import {
  SEEDED_PROJECT_APPLICANTS,
} from "@/data/project-applicants";

export type ApplicationStatus = "Applied" | "Shortlisted" | "Accepted" | "Rejected";

export interface ProjectApplication {
  id: string;
  projectId: string;
  studentId?: string;
  studentName: string;
  studentHeadline: string;
  college: string;
  skills: string[];
  portfolioSummary: string;
  portfolioUrl?: string;
  applicationMessage: string;
  status: ApplicationStatus;
  matchScore?: string; // Clearly labelled as demo score only
  avatarInitials: string;
  appliedDate: string;
  createdAt: string;
  isSeededDemo?: boolean;
}

const STORAGE_KEY = "skillbridge_client_applications_store";

/**
 * Normalizes old/legacy review status ("Under Review" -> "Applied")
 */
function normalizeStatus(status: string): ApplicationStatus {
  if (status === "Under Review") return "Applied";
  if (status === "Shortlisted") return "Shortlisted";
  if (status === "Accepted") return "Accepted";
  if (status === "Rejected") return "Rejected";
  return "Applied";
}

/**
 * Clean repository service for prototype project applications.
 * Keeps data logic decoupled from UI components so a real backend/database
 * can replace this storage layer without touching React views.
 */
export const clientApplicationsRepository = {
  /**
   * Get all applications stored in localStorage.
   */
  getStoredApplications(): Record<string, ProjectApplication[]> {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  },

  /**
   * Saves custom applications mapping to localStorage and broadcasts event.
   */
  saveApplications(apps: Record<string, ProjectApplication[]>) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
      window.dispatchEvent(new Event("skillbridge_applications_updated"));
    } catch (err) {
      console.error("Failed to save applications to storage:", err);
    }
  },

  /**
   * Get all applications for a given project ID.
   * Merges persistent user-updated applications with initial seeded applicants.
   */
  getApplicationsByProjectId(projectId: string): ProjectApplication[] {
    const storedMap = this.getStoredApplications();

    if (storedMap[projectId] && Array.isArray(storedMap[projectId])) {
      return storedMap[projectId];
    }

    // Fall back to seeded demo applicants for known demo projects
    const seeded = SEEDED_PROJECT_APPLICANTS[projectId] || [];
    const normalizedSeeded: ProjectApplication[] = seeded.map((app) => ({
      id: app.id,
      projectId: app.projectId,
      studentId: undefined,
      studentName: app.name,
      studentHeadline: app.headline,
      college: app.college,
      skills: app.relevantSkills,
      portfolioSummary: app.portfolioSummary,
      portfolioUrl: app.portfolioUrl,
      applicationMessage: app.applicationMessage,
      status: normalizeStatus(app.status),
      matchScore: app.demoMatchScore,
      avatarInitials: app.avatarInitials,
      appliedDate: app.appliedDate,
      createdAt: new Date("2026-09-05").toISOString(),
      isSeededDemo: true,
    }));

    return normalizedSeeded;
  },

  /**
   * Updates an applicant's status and persists to localStorage.
   */
  updateApplicantStatus(
    projectId: string,
    applicantId: string,
    newStatus: ApplicationStatus
  ): ProjectApplication[] {
    const currentList = this.getApplicationsByProjectId(projectId);
    const updatedList = currentList.map((app) =>
      app.id === applicantId ? { ...app, status: newStatus } : app
    );

    const storedMap = this.getStoredApplications();
    storedMap[projectId] = updatedList;
    this.saveApplications(storedMap);

    return updatedList;
  },

  /**
   * Creates an application (used when simulating student application submissions).
   */
  createApplication(
    appData: Omit<ProjectApplication, "id" | "createdAt" | "status">
  ): ProjectApplication {
    const id = `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const newApp: ProjectApplication = {
      ...appData,
      id,
      status: "Applied",
      createdAt: now.toISOString(),
      appliedDate: now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      isSeededDemo: false,
    };

    const storedMap = this.getStoredApplications();
    const existing = storedMap[appData.projectId] || this.getApplicationsByProjectId(appData.projectId);
    storedMap[appData.projectId] = [newApp, ...existing];
    this.saveApplications(storedMap);

    return newApp;
  },
};
