import { ApplicationStatus } from "@/types";

export const applicationStateMachine = {
  isValidTransition(currentStatus: ApplicationStatus, newStatus: ApplicationStatus, role: "CLIENT" | "STUDENT"): boolean {
    if (currentStatus === newStatus) return true;

    if (role === "CLIENT") {
      switch (currentStatus) {
        case "Pending":
          return (
            newStatus === "Under Review" ||
            newStatus === "Shortlisted" ||
            newStatus === "Accepted" ||
            newStatus === "Rejected"
          );
        case "Under Review":
          return (
            newStatus === "Shortlisted" ||
            newStatus === "Accepted" ||
            newStatus === "Rejected"
          );
        case "Shortlisted":
          return newStatus === "Accepted" || newStatus === "Rejected";
        case "Accepted":
        case "Rejected":
        case "Withdrawn":
          return false; // Terminal states for Client
      }
    } else if (role === "STUDENT") {
      switch (currentStatus) {
        case "Pending":
        case "Under Review":
        case "Shortlisted":
          return newStatus === "Withdrawn";
        case "Accepted":
        case "Rejected":
        case "Withdrawn":
          return false; // Terminal states for Student
      }
    }

    return false;
  }
};
