import { prisma } from "@/lib/prisma";
import { UserRole, ApplicationStatus, WorkStatus } from "@prisma/client";
import { AuthenticatedUser } from "../auth/context";

export async function getStudentDashboardMetrics(auth: AuthenticatedUser) {
  if (auth.role !== UserRole.STUDENT) {
    return { error: "FORBIDDEN" as const };
  }

  // Resolve student profile
  let studentProfile = auth.studentProfile;
  if (!studentProfile) {
    studentProfile = await prisma.studentProfile.findFirst({
      where: { userId: auth.user.id },
    });
  }

  if (!studentProfile) {
    return { error: "NOT_FOUND" as const, message: "Student profile not found" };
  }

  const studentId = studentProfile.id;

  // Execute efficient parallel counts
  const [
    totalApplications,
    pendingApplications,
    shortlistedApplications,
    acceptedApplications,
    rejectedApplications,
    activeContracts,
    completedContracts,
    portfolioCount,
  ] = await Promise.all([
    prisma.application.count({ where: { studentId } }),
    prisma.application.count({ where: { studentId, status: ApplicationStatus.PENDING } }),
    prisma.application.count({ where: { studentId, status: ApplicationStatus.SHORTLISTED } }),
    prisma.application.count({ where: { studentId, status: ApplicationStatus.ACCEPTED } }),
    prisma.application.count({ where: { studentId, status: ApplicationStatus.REJECTED } }),
    prisma.workContract.count({ where: { studentId, status: WorkStatus.IN_PROGRESS } }),
    prisma.workContract.count({ where: { studentId, status: WorkStatus.COMPLETED } }),
    prisma.portfolioProject.count({ where: { studentId } }),
  ]);

  return {
    stats: {
      applications: totalApplications,
      activeProjects: activeContracts,
      completed: completedContracts,
      profileStrength: studentProfile.profileStrength ?? 85,
      breakdown: {
        pending: pendingApplications,
        shortlisted: shortlistedApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
      },
      portfolioCount,
    },
    profile: {
      name: auth.user.name,
      headline: studentProfile.headline,
      avatar: auth.user.avatar || null,
    },
  };
}
