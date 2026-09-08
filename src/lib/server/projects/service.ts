import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";

export interface ProjectQueryParams {
  status?: string;
  category?: string;
  search?: string;
  clientId?: string;
  limit?: number;
  offset?: number;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  fullDescription?: string;
  category: string;
  budget: string;
  budgetValue?: number;
  duration: string;
  durationWeeks?: number;
  experienceLevel: string;
  deliverables?: string[];
  deadline?: string;
  skills?: string[];
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  fullDescription?: string;
  category?: string;
  budget?: string;
  budgetValue?: number;
  duration?: string;
  durationWeeks?: number;
  experienceLevel?: string;
  deliverables?: string[];
  deadline?: string;
  status?: ProjectStatus;
  timelineNote?: string;
}

export async function listProjects(params: ProjectQueryParams = {}) {
  const where: any = {};

  if (params.status) {
    const upperStatus = params.status.toUpperCase() as ProjectStatus;
    if (Object.values(ProjectStatus).includes(upperStatus)) {
      where.status = upperStatus;
    }
  }

  if (params.category) {
    where.category = {
      equals: params.category,
      mode: "insensitive",
    };
  }

  if (params.clientId) {
    where.clientId = params.clientId;
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      {
        skills: {
          some: {
            skill: {
              name: { contains: q, mode: "insensitive" },
            },
          },
        },
      },
    ];
  }

  return prisma.project.findMany({
    where,
    take: Math.min(params.limit || 50, 100),
    skip: params.offset || 0,
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
          location: true,
          rating: true,
        },
      },
      skills: {
        include: {
          skill: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
          industry: true,
          description: true,
          location: true,
          rating: true,
          projectsPostedCount: true,
          studentsHiredCount: true,
        },
      },
      skills: {
        include: {
          skill: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });
}

export async function createProject(clientId: string, input: CreateProjectInput) {
  if (!input.title?.trim()) throw new Error("Title is required");
  if (!input.description?.trim()) throw new Error("Description is required");
  if (!input.category?.trim()) throw new Error("Category is required");
  if (!input.budget?.trim()) throw new Error("Budget is required");
  if (!input.duration?.trim()) throw new Error("Duration is required");
  if (!input.experienceLevel?.trim()) throw new Error("Experience level is required");

  // Parse numeric budgetValue if not explicitly provided
  const parsedBudget = parseInt(input.budget.replace(/[^0-9]/g, ""), 10);
  const budgetValue = input.budgetValue ?? (isNaN(parsedBudget) ? undefined : parsedBudget);

  // Create project with associated skills
  return prisma.project.create({
    data: {
      clientId, // Strictly derived server-side from authenticated client
      title: input.title.trim(),
      description: input.description.trim(),
      fullDescription: input.fullDescription?.trim() || null,
      category: input.category.trim(),
      budget: input.budget.trim(),
      budgetValue,
      duration: input.duration.trim(),
      durationWeeks: input.durationWeeks,
      experienceLevel: input.experienceLevel.trim(),
      deliverables: input.deliverables || [],
      deadline: input.deadline || null,
      status: ProjectStatus.OPEN,
      skills: input.skills && input.skills.length > 0
        ? {
            create: await Promise.all(
              input.skills.map(async (skillName) => {
                const skill = await prisma.skill.upsert({
                  where: { name: skillName.trim() },
                  update: {},
                  create: { name: skillName.trim() },
                });
                return {
                  skillId: skill.id,
                };
              })
            ),
          }
        : undefined,
    },
    include: {
      client: true,
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });
}

export async function updateProject(
  projectId: string,
  clientId: string,
  input: UpdateProjectInput
) {
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!existing) {
    return { error: "NOT_FOUND" as const };
  }

  // Strict ownership enforcement
  if (existing.clientId !== clientId) {
    return { error: "FORBIDDEN" as const };
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      ...(input.fullDescription !== undefined ? { fullDescription: input.fullDescription.trim() } : {}),
      ...(input.category !== undefined ? { category: input.category.trim() } : {}),
      ...(input.budget !== undefined ? { budget: input.budget.trim() } : {}),
      ...(input.budgetValue !== undefined ? { budgetValue: input.budgetValue } : {}),
      ...(input.duration !== undefined ? { duration: input.duration.trim() } : {}),
      ...(input.durationWeeks !== undefined ? { durationWeeks: input.durationWeeks } : {}),
      ...(input.experienceLevel !== undefined ? { experienceLevel: input.experienceLevel.trim() } : {}),
      ...(input.deliverables !== undefined ? { deliverables: input.deliverables } : {}),
      ...(input.deadline !== undefined ? { deadline: input.deadline } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.timelineNote !== undefined ? { timelineNote: input.timelineNote } : {}),
    },
    include: {
      client: true,
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });

  return { project: updated };
}
