import { prisma } from "@/lib/prisma";
import { UserRole, ProjectStatus } from "@prisma/client";
import { AuthenticatedUser } from "../auth/context";

export async function getRecommendedProjects(auth: AuthenticatedUser) {
  if (auth.role !== UserRole.STUDENT) {
    return { error: "FORBIDDEN" as const };
  }

  // 1. Resolve student profile
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

  // 2. Fetch student's skills
  const studentSkills = await prisma.studentSkill.findMany({
    where: { studentId },
    include: { skill: true },
  });
  const studentSkillSet = new Set(
    studentSkills.map((s) => s.skill.name.toLowerCase().trim())
  );

  // 3. Fetch projects student has already applied to
  const existingApplications = await prisma.application.findMany({
    where: { studentId },
    select: { projectId: true },
  });
  const appliedProjectIds = new Set(existingApplications.map((a) => a.projectId));

  // 4. Fetch open marketplace projects
  const openProjects = await prisma.project.findMany({
    where: {
      status: ProjectStatus.OPEN,
      id: { notIn: Array.from(appliedProjectIds) },
    },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
      client: {
        select: {
          companyName: true,
          rating: true,
          location: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 5. Deterministic skill-matching & ranking
  const scoredProjects = openProjects.map((project) => {
    const projectSkillNames = project.skills.map((s) => s.skill.name);
    const matchCount = projectSkillNames.filter((name) =>
      studentSkillSet.has(name.toLowerCase().trim())
    ).length;

    const totalSkills = projectSkillNames.length;
    let matchScore = 75; // Baseline match

    if (totalSkills > 0) {
      const matchRatio = matchCount / totalSkills;
      matchScore = Math.min(98, Math.max(75, 75 + Math.round(matchRatio * 23)));
    }

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      budget: project.budget,
      duration: project.duration,
      match: matchScore,
      skills: projectSkillNames,
      category: project.category,
      clientName: project.client.companyName,
      matchCount,
      createdAt: project.createdAt,
    };
  });

  // Sort by matching skills count descending, then match score, then recency
  scoredProjects.sort((a, b) => {
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount;
    }
    if (b.match !== a.match) {
      return b.match - a.match;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Limit to top 6 recommendations
  const topRecommendations = scoredProjects.slice(0, 6).map(({ matchCount, createdAt, ...rest }) => rest);

  return { recommendations: topRecommendations };
}
