import { prisma } from "@/lib/prisma";
import { ApplicationStatus, ProjectStatus, UserRole, WorkStatus } from "@prisma/client";
import { isValidApplicationTransition, normalizeApplicationStatus } from "./state-machine";
import { AuthenticatedUser } from "../auth/context";

export interface CreateApplicationInput {
  proposal: string;
  proposedBudget?: string;
  estimatedCompletion?: string;
}

export async function createApplication(
  projectId: string,
  studentId: string,
  input: CreateApplicationInput
) {
  if (!input.proposal?.trim()) {
    throw new Error("Proposal is required");
  }

  // 1. Verify project exists and is open
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return { error: "PROJECT_NOT_FOUND" as const };
  }

  if (project.status === ProjectStatus.CLOSED) {
    return { error: "PROJECT_CLOSED" as const };
  }

  // 2. Check for duplicate application at application layer before DB constraint
  const existing = await prisma.application.findUnique({
    where: {
      projectId_studentId: {
        projectId,
        studentId,
      },
    },
  });

  if (existing) {
    return { error: "DUPLICATE_APPLICATION" as const };
  }

  // 3. Create application
  const application = await prisma.application.create({
    data: {
      projectId,
      studentId,
      status: ApplicationStatus.PENDING,
      proposal: input.proposal.trim(),
      proposedBudget: input.proposedBudget?.trim() || null,
      estimatedCompletion: input.estimatedCompletion?.trim() || null,
    },
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
  });

  return { application };
}

export async function getApplicationsForUser(auth: AuthenticatedUser) {
  if (auth.role === UserRole.STUDENT) {
    if (!auth.studentProfile) return [];
    return prisma.application.findMany({
      where: {
        studentId: auth.studentProfile.id,
      },
      include: {
        project: {
          include: {
            client: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        workContract: true,
      },
      orderBy: {
        appliedAt: "desc",
      },
    });
  } else if (auth.role === UserRole.CLIENT) {
    if (!auth.clientProfile) return [];
    return prisma.application.findMany({
      where: {
        project: {
          clientId: auth.clientProfile.id,
        },
      },
      include: {
        project: true,
        student: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        workContract: true,
      },
      orderBy: {
        appliedAt: "desc",
      },
    });
  }

  return [];
}

export async function getApplicationById(id: string, auth: AuthenticatedUser) {
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: true,
          skills: {
            include: {
              skill: true,
            },
          },
        },
      },
      student: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              avatar: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
          portfolio: true,
        },
      },
      workContract: true,
    },
  });

  if (!application) {
    return { error: "NOT_FOUND" as const };
  }

  const isStudent = auth.role === UserRole.STUDENT && auth.studentProfile?.id === application.studentId;
  const isClient = auth.role === UserRole.CLIENT && auth.clientProfile?.id === application.project.clientId;

  if (!isStudent && !isClient) {
    return { error: "FORBIDDEN" as const };
  }

  return { application };
}

export async function getProjectApplicants(projectId: string, clientProfileId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return { error: "PROJECT_NOT_FOUND" as const };
  }

  // Only the owning client may view applicant pipeline
  if (project.clientId !== clientProfileId) {
    return { error: "FORBIDDEN" as const };
  }

  const applications = await prisma.application.findMany({
    where: { projectId },
    include: {
      student: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              avatar: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
          portfolio: true,
        },
      },
      workContract: true,
    },
    orderBy: {
      appliedAt: "desc",
    },
  });

  return { project, applications };
}

export async function updateApplicationStatus(
  applicationId: string,
  rawStatus: string,
  auth: AuthenticatedUser
) {
  const targetStatus = normalizeApplicationStatus(rawStatus);
  if (!targetStatus) {
    return { error: "INVALID_STATUS" as const };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      project: true,
      workContract: true,
    },
  });

  if (!application) {
    return { error: "NOT_FOUND" as const };
  }

  // Authorize transition based on user role
  const isClient = auth.role === UserRole.CLIENT && auth.clientProfile?.id === application.project.clientId;
  const isStudent = auth.role === UserRole.STUDENT && auth.studentProfile?.id === application.studentId;

  if (!isClient && !isStudent) {
    return { error: "FORBIDDEN" as const };
  }

  const role = isClient ? "CLIENT" : "STUDENT";

  // Role authorization: Students can only withdraw their application
  if (role === "STUDENT" && targetStatus !== ApplicationStatus.WITHDRAWN) {
    return { error: "FORBIDDEN" as const };
  }

  // Clients cannot withdraw an application
  if (role === "CLIENT" && targetStatus === ApplicationStatus.WITHDRAWN) {
    return { error: "FORBIDDEN" as const };
  }

  // Validate state machine rules
  if (!isValidApplicationTransition(application.status, targetStatus, role)) {
    return {
      error: "INVALID_TRANSITION" as const,
      currentStatus: application.status,
      targetStatus,
    };
  }

  // Transactionally update status and create WorkContract if ACCEPTED
  if (targetStatus === ApplicationStatus.ACCEPTED) {
    const result = await prisma.$transaction(async (tx) => {
      const updatedApp = await tx.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.ACCEPTED },
        include: { project: true, student: true },
      });

      // Idempotently create WorkContract if not already created
      let contract = await tx.workContract.findUnique({
        where: { applicationId: application.id },
      });

      if (!contract) {
        contract = await tx.workContract.create({
          data: {
            applicationId: application.id,
            projectId: application.projectId,
            studentId: application.studentId,
            clientId: application.project.clientId,
            status: WorkStatus.IN_PROGRESS,
            progress: 0,
            lastActivity: "Work contract initiated upon application acceptance",
          },
        });

        // Increment student hired counter on client profile
        await tx.clientProfile.update({
          where: { id: application.project.clientId },
          data: { studentsHiredCount: { increment: 1 } },
        });
      }

      return { application: updatedApp, workContract: contract };
    }, {
      maxWait: 15000,
      timeout: 20000,
    });

    return { application: result.application, workContract: result.workContract };
  } else {
    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: { status: targetStatus },
      include: { project: true },
    });

    return { application: updatedApp };
  }
}
