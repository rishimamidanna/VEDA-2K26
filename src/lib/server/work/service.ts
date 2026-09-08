import { prisma } from "@/lib/prisma";
import { UserRole, WorkStatus } from "@prisma/client";
import { AuthenticatedUser } from "../auth/context";

export function normalizeWorkStatus(status: string): WorkStatus | null {
  const clean = status.trim().toUpperCase().replace(/\s+/g, "_");
  if (Object.values(WorkStatus).includes(clean as WorkStatus)) {
    return clean as WorkStatus;
  }
  return null;
}

export async function getWorkContractsForUser(auth: AuthenticatedUser) {
  if (auth.role === UserRole.STUDENT) {
    if (!auth.studentProfile) return [];
    return prisma.workContract.findMany({
      where: {
        studentId: auth.studentProfile.id,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
        application: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else if (auth.role === UserRole.CLIENT) {
    if (!auth.clientProfile) return [];
    return prisma.workContract.findMany({
      where: {
        clientId: auth.clientProfile.id,
      },
      include: {
        project: true,
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        application: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  return [];
}

export async function getWorkContractById(id: string, auth: AuthenticatedUser) {
  const contract = await prisma.workContract.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: true,
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
        },
      },
      application: true,
    },
  });

  if (!contract) {
    return { error: "NOT_FOUND" as const };
  }

  // Enforce access: must be either the student or the client on this contract
  const isStudent = auth.role === UserRole.STUDENT && auth.studentProfile?.id === contract.studentId;
  const isClient = auth.role === UserRole.CLIENT && auth.clientProfile?.id === contract.clientId;

  if (!isStudent && !isClient) {
    return { error: "FORBIDDEN" as const };
  }

  return { contract };
}

export interface UpdateWorkContractInput {
  status?: string;
  progress?: number;
  lastActivity?: string;
}

export async function updateWorkContract(
  id: string,
  input: UpdateWorkContractInput,
  auth: AuthenticatedUser
) {
  const contract = await prisma.workContract.findUnique({
    where: { id },
  });

  if (!contract) {
    return { error: "NOT_FOUND" as const };
  }

  // Enforce access: must be either student or client
  const isStudent = auth.role === UserRole.STUDENT && auth.studentProfile?.id === contract.studentId;
  const isClient = auth.role === UserRole.CLIENT && auth.clientProfile?.id === contract.clientId;

  if (!isStudent && !isClient) {
    return { error: "FORBIDDEN" as const };
  }

  const updateData: any = {};

  if (input.status) {
    const validStatus = normalizeWorkStatus(input.status);
    if (!validStatus) {
      return { error: "INVALID_STATUS" as const };
    }
    updateData.status = validStatus;
  }

  if (typeof input.progress === "number") {
    if (input.progress < 0 || input.progress > 100) {
      return { error: "INVALID_PROGRESS" as const };
    }
    updateData.progress = input.progress;
  }

  if (input.lastActivity?.trim()) {
    updateData.lastActivity = input.lastActivity.trim();
  }

  const updated = await prisma.workContract.update({
    where: { id },
    data: updateData,
    include: {
      project: true,
      student: true,
      application: true,
    },
  });

  return { contract: updated };
}
