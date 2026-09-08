import { Application, ApplicationStatus } from "@/types";
import { sharedRepository } from "./shared-repository";
import { applicationStateMachine } from "./application-state-machine";

export type ProjectApplication = Application;

export const clientApplicationsRepository = {
  getApplicationsByProjectId(projectId: string): ProjectApplication[] {
    const project = sharedRepository.getProjects().find(p => p.id === projectId);
    if (!project || project.clientId !== "client-1") return [];
    return sharedRepository.getApplications().filter(a => a.projectId === projectId);
  },

  updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus): ProjectApplication | null {
    const allApps = sharedRepository.getApplications();
    const app = allApps.find(a => a.id === applicationId);
    if (app) {
      if (!applicationStateMachine.isValidTransition(app.status, newStatus, "CLIENT")) {
        console.warn(`Invalid transition from ${app.status} to ${newStatus} for CLIENT`);
        return null;
      }
      const project = sharedRepository.getProjects().find(p => p.id === app.projectId);
      if (project && project.clientId === "client-1") {
        app.status = newStatus;
        sharedRepository.saveApplication(app);
        return app;
      }
    }
    return null;
  },

  getAcceptedApplications(): ProjectApplication[] {
    const clientProjectIds = new Set(
      sharedRepository.getProjects()
        .filter(p => p.clientId === "client-1")
        .map(p => p.id)
    );
    return sharedRepository.getApplications().filter(a => a.status === "Accepted" && clientProjectIds.has(a.projectId));
  }
};

