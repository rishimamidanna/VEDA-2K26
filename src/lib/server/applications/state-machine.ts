import { ApplicationStatus } from "@prisma/client";

export function normalizeApplicationStatus(status: string): ApplicationStatus | null {
  const clean = status.trim().toUpperCase().replace(/\s+/g, "_");
  if (Object.values(ApplicationStatus).includes(clean as ApplicationStatus)) {
    return clean as ApplicationStatus;
  }
  return null;
}

export function isValidApplicationTransition(
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus,
  role: "CLIENT" | "STUDENT"
): boolean {
  if (currentStatus === newStatus) return true;

  if (role === "CLIENT") {
    switch (currentStatus) {
      case ApplicationStatus.PENDING:
        return (
          newStatus === ApplicationStatus.UNDER_REVIEW ||
          newStatus === ApplicationStatus.SHORTLISTED ||
          newStatus === ApplicationStatus.ACCEPTED ||
          newStatus === ApplicationStatus.REJECTED
        );
      case ApplicationStatus.UNDER_REVIEW:
        return (
          newStatus === ApplicationStatus.SHORTLISTED ||
          newStatus === ApplicationStatus.ACCEPTED ||
          newStatus === ApplicationStatus.REJECTED
        );
      case ApplicationStatus.SHORTLISTED:
        return (
          newStatus === ApplicationStatus.ACCEPTED ||
          newStatus === ApplicationStatus.REJECTED
        );
      case ApplicationStatus.ACCEPTED:
      case ApplicationStatus.REJECTED:
      case ApplicationStatus.WITHDRAWN:
        return false; // Terminal states
    }
  } else if (role === "STUDENT") {
    switch (currentStatus) {
      case ApplicationStatus.PENDING:
      case ApplicationStatus.UNDER_REVIEW:
      case ApplicationStatus.SHORTLISTED:
        return newStatus === ApplicationStatus.WITHDRAWN;
      case ApplicationStatus.ACCEPTED:
      case ApplicationStatus.REJECTED:
      case ApplicationStatus.WITHDRAWN:
        return false; // Terminal states for Student
    }
  }

  return false;
}
