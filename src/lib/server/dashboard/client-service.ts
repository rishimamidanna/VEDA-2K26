import { prisma } from "@/lib/prisma";
import { UserRole, ProjectStatus, WorkStatus } from "@prisma/client";
import { AuthenticatedUser } from "../auth/context";

export async function getClientDashboardMetrics(auth: AuthenticatedUser) {
  if (auth.role !== UserRole.CLIENT) {
    return { error: "FORBIDDEN" as const };
  }

  let clientProfile = auth.clientProfile;
  if (!clientProfile) {
    clientProfile = await prisma.clientProfile.findFirst({
      where: { userId: auth.user.id },
    });
  }

  if (!clientProfile) {
    return { error: "NOT_FOUND" as const, message: "Client profile not found" };
  }

  const clientId = clientProfile.id;

  // Execute efficient parallel aggregations
  const [
    totalProjects,
    openProjects,
    inProgressProjects,
    completedProjects,
    totalApplicants,
    activeContracts,
    completedContracts,
    hiredGroup,
    recentProjectsRaw,
    recentApplicationsRaw,
  ] = await Promise.all([
    prisma.project.count({ where: { clientId } }),
    prisma.project.count({ where: { clientId, status: ProjectStatus.OPEN } }),
    prisma.project.count({ where: { clientId, status: ProjectStatus.IN_PROGRESS } }),
    prisma.project.count({ where: { clientId, status: ProjectStatus.COMPLETED } }),
    prisma.application.count({ where: { project: { clientId } } }),
    prisma.workContract.count({ where: { clientId, status: WorkStatus.IN_PROGRESS } }),
    prisma.workContract.count({ where: { clientId, status: WorkStatus.COMPLETED } }),
    prisma.workContract.groupBy({
      by: ["studentId"],
      where: { clientId },
    }),
    prisma.project.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        _count: {
          select: { applications: true },
        },
      },
    }),
    prisma.application.findMany({
      where: { project: { clientId } },
      orderBy: { appliedAt: "desc" },
      take: 4,
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
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
      },
    }),
  ]);

  const hiredTalentCount = hiredGroup.length;
  const activeProjectsCount = openProjects + inProgressProjects;

  const recentProjects = recentProjectsRaw.map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status === "IN_PROGRESS" ? "In Progress" : p.status === "OPEN" ? "Open" : p.status === "COMPLETED" ? "Completed" : "Draft",
    budget: p.budget,
    applicantsCount: p._count.applications,
    createdAt: p.createdAt.toISOString(),
  }));

  const recentApplicants = recentApplicationsRaw.map((app: any) => {
    const studentName = app.student?.user?.name || "Student Applicant";
    const avatarInitials =
      app.student?.user?.avatar ||
      studentName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const skills = app.student?.skills?.map((s: any) => s.skill?.name || s.name) || [];

    return {
      id: app.id,
      name: studentName,
      avatarInitials,
      role: app.student?.headline || app.student?.college || "Student Builder",
      skills: skills.slice(0, 3),
      projectAppliedFor: app.project?.title || "Project",
      matchScore: "94%",
      status: app.status,
      appliedAt: app.appliedAt ? new Date(app.appliedAt).toISOString() : new Date().toISOString(),
    };
  });

  return {
    stats: {
      activeProjects: activeProjectsCount,
      openProjects,
      inProgressProjects,
      completedProjects,
      totalProjects,
      totalApplicants,
      hiredTalent: hiredTalentCount,
      activeContracts,
      completedContracts,
    },
    recentProjects,
    recentApplicants,
  };
}
