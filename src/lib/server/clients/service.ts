import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../auth/context";

export interface UpdateClientInput {
  name?: string;
  companyName?: string;
  industry?: string;
  description?: string;
  location?: string;
}

export async function getClientById(id: string) {
  const client = await prisma.clientProfile.findFirst({
    where: {
      OR: [{ id }, { userId: id }],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          createdAt: true,
        },
      },
      projects: {
        where: {
          status: "OPEN",
        },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      },
    },
  });

  if (!client) {
    return { error: "NOT_FOUND" as const };
  }

  return {
    client: {
      id: client.id,
      userId: client.userId,
      name: client.user?.name,
      companyName: client.companyName,
      industry: client.industry,
      description: client.description,
      location: client.location,
      rating: client.rating,
      projectsPostedCount: client.projectsPostedCount,
      studentsHiredCount: client.studentsHiredCount,
      openProjects: client.projects,
    },
  };
}

export async function updateClientProfile(
  id: string,
  input: UpdateClientInput,
  auth: AuthenticatedUser
) {
  const client = await prisma.clientProfile.findFirst({
    where: {
      OR: [{ id }, { userId: id }],
    },
  });

  if (!client) {
    return { error: "NOT_FOUND" as const };
  }

  const isOwner =
    auth.role === UserRole.CLIENT &&
    (auth.clientProfile?.id === client.id || auth.user.id === client.userId);

  if (!isOwner) {
    return { error: "FORBIDDEN" as const };
  }

  if (input.name && input.name.trim().length > 0) {
    await prisma.user.update({
      where: { id: client.userId },
      data: { name: input.name.trim() },
    });
  }

  const updateData: any = {};
  if (input.companyName !== undefined) updateData.companyName = input.companyName.trim();
  if (input.industry !== undefined) updateData.industry = input.industry.trim();
  if (input.description !== undefined) updateData.description = input.description.trim();
  if (input.location !== undefined) updateData.location = input.location.trim();

  const updated = await prisma.clientProfile.update({
    where: { id: client.id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  return { client: updated };
}
