import { Application, ApplicationStatus } from "@/types";
import { sharedRepository } from "./shared-repository";

export type ProjectApplication = Application;

export const clientApplicationsRepository = {
  getApplicationsByProjectId(projectId: string): ProjectApplication[] {
    return sharedRepository.getApplications().filter(a => a.projectId === projectId);
  },

  updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus): ProjectApplication | null {
    const all = sharedRepository.getApplications();
    const app = all.find(a => a.id === applicationId);
    if (app) {
      app.status = newStatus;
      sharedRepository.saveApplication(app);
      return app;
    }
    return null;
  },

  getAcceptedApplications(): ProjectApplication[] {
    return sharedRepository.getApplications().filter(a => a.status === "Accepted");
  }
};

