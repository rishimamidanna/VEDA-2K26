import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../auth/context";

export interface ListStudentsQuery {
  search?: string;
  skills?: string | string[];
  expertise?: string;
  experience?: string;
  availability?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateStudentInput {
  name?: string;
  headline?: string;
  about?: string;
  college?: string;
  location?: string;
  expertise?: string;
  experienceLevel?: string;
  availability?: string;
  hourlyRate?: string;
  profileStrength?: number;
  isPublic?: boolean;
  skills?: string[];
}

export interface AddPortfolioInput {
  title: string;
  description?: string;
  technologies?: string[];
  tags?: string[];
  projectUrl?: string;
  imageUrl?: string;
}

/**
 * Sanitizes a student profile for public consumption.
 * Never includes passwordHash, session tokens, or private user credentials.
 */
function sanitizeStudent(dbStudent: any, isOwner: boolean = false) {
  if (!dbStudent) return null;

  return {
    id: dbStudent.id,
    userId: dbStudent.userId,
    name: dbStudent.user?.name || "Student",
    email: isOwner ? dbStudent.user?.email : undefined,
    avatar: dbStudent.user?.avatar || null,
    avatarInitials:
      dbStudent.user?.avatar ||
      (dbStudent.user?.name || "ST")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    headline: dbStudent.headline || "Student Freelancer",
    about: dbStudent.about || "Passionate student builder specializing in software development.",
    college: dbStudent.college || "University",
    location: dbStudent.location || "Bengaluru, India",
    expertise: dbStudent.expertise || "Web Development",
    experienceLevel: dbStudent.experienceLevel || "Intermediate",
    availability: dbStudent.availability || "Available Now",
    hourlyRate: dbStudent.hourlyRate || "₹500/hr",
    profileStrength: dbStudent.profileStrength ?? 85,
    isPublic: typeof dbStudent.isPublic === "boolean" ? dbStudent.isPublic : true,
    createdAt: dbStudent.createdAt ? new Date(dbStudent.createdAt).toISOString() : new Date().toISOString(),
    skills: Array.isArray(dbStudent.skills)
      ? dbStudent.skills.map((s: any) => ({
          id: s.skill?.id || s.id,
          name: s.skill?.name || s.name,
          proficiency: s.proficiency || "INTERMEDIATE",
        }))
      : [],
    portfolio: Array.isArray(dbStudent.portfolio)
      ? dbStudent.portfolio.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          tags: p.tags || [],
          projectUrl: p.projectUrl || null,
          imageUrl: p.imageUrl || null,
        }))
      : [],
    stats: {
      projectsCompleted: dbStudent.workContracts ? dbStudent.workContracts.filter((w: any) => w.status === "COMPLETED").length : 0,
      projectsInProgress: dbStudent.workContracts ? dbStudent.workContracts.filter((w: any) => w.status === "IN_PROGRESS").length : 0,
      clientRating: 4.9,
      profileViews: 128,
    },
  };
}

export async function listStudents(query: ListStudentsQuery = {}) {
  const where: any = {
    isPublic: true,
  };

  if (query.expertise && query.expertise !== "All Categories") {
    where.expertise = { equals: query.expertise, mode: "insensitive" };
  }

  if (query.experience && query.experience !== "All Levels") {
    where.experienceLevel = { equals: query.experience, mode: "insensitive" };
  }

  if (query.availability && query.availability !== "All Availabilities") {
    where.availability = { equals: query.availability, mode: "insensitive" };
  }

  // Handle skill filter
  if (query.skills) {
    const skillList = Array.isArray(query.skills) ? query.skills : [query.skills];
    const filteredSkills = skillList.filter((s) => s.trim().length > 0);
    if (filteredSkills.length > 0) {
      where.skills = {
        some: {
          skill: {
            name: {
              in: filteredSkills,
              mode: "insensitive",
            },
          },
        },
      };
    }
  }

  const students = await prisma.studentProfile.findMany({
    where,
    take: Math.min(query.limit || 50, 100),
    skip: query.offset || 0,
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
      portfolio: true,
      workContracts: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let sanitized = students
    .map((s) => sanitizeStudent(s, false))
    .filter((s): s is NonNullable<typeof s> => s !== null);

  // Client-side text search across name, headline, about, college, and skills
  if (query.search && query.search.trim().length > 0) {
    const q = query.search.toLowerCase().trim();
    sanitized = sanitized.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.headline.toLowerCase().includes(q) ||
        s.about.toLowerCase().includes(q) ||
        s.college.toLowerCase().includes(q) ||
        s.skills.some((sk: any) => sk.name.toLowerCase().includes(q))
    );
  }

  return sanitized;
}

export async function getStudentById(id: string, auth?: AuthenticatedUser | null) {
  // Support lookup by studentProfile.id OR user.id
  let student = await prisma.studentProfile.findFirst({
    where: {
      OR: [{ id }, { userId: id }],
    },
    include: {
      user: {
        select: {
          id: true,
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
      workContracts: true,
    },
  });

  if (!student) {
    return { error: "NOT_FOUND" as const };
  }

  const isOwner = auth?.role === UserRole.STUDENT && (auth.studentProfile?.id === student.id || auth.user.id === student.userId);

  // If the profile is private and caller is not the owner, hide from public discovery
  if (!student.isPublic && !isOwner) {
    return { error: "NOT_FOUND" as const };
  }

  return { student: sanitizeStudent(student, isOwner) };
}

export async function updateStudentProfile(
  id: string,
  input: UpdateStudentInput,
  auth: AuthenticatedUser
) {
  // 1. Resolve student profile
  const student = await prisma.studentProfile.findFirst({
    where: {
      OR: [{ id }, { userId: id }],
    },
    include: {
      user: true,
    },
  });

  if (!student) {
    return { error: "NOT_FOUND" as const };
  }

  // 2. Enforce strict ownership
  const isOwner =
    auth.role === UserRole.STUDENT &&
    (auth.studentProfile?.id === student.id || auth.user.id === student.userId);

  if (!isOwner) {
    return { error: "FORBIDDEN" as const };
  }

  // 3. Update User name if provided
  if (input.name && input.name.trim().length > 0) {
    await prisma.user.update({
      where: { id: student.userId },
      data: { name: input.name.trim() },
    });
  }

  // 4. Update StudentProfile fields
  const updateData: any = {};
  if (input.headline !== undefined) updateData.headline = input.headline.trim();
  if (input.about !== undefined) updateData.about = input.about.trim();
  if (input.college !== undefined) updateData.college = input.college.trim();
  if (input.location !== undefined) updateData.location = input.location.trim();
  if (input.expertise !== undefined) updateData.expertise = input.expertise.trim();
  if (input.experienceLevel !== undefined) updateData.experienceLevel = input.experienceLevel.trim();
  if (input.availability !== undefined) updateData.availability = input.availability.trim();
  if (input.hourlyRate !== undefined) updateData.hourlyRate = input.hourlyRate.trim();
  if (typeof input.profileStrength === "number") updateData.profileStrength = input.profileStrength;
  if (typeof input.isPublic === "boolean") updateData.isPublic = input.isPublic;

  await prisma.studentProfile.update({
    where: { id: student.id },
    data: updateData,
  });

  // 5. Update skills if provided
  if (Array.isArray(input.skills)) {
    // Delete existing student skills
    await prisma.studentSkill.deleteMany({
      where: { studentId: student.id },
    });

    // Re-link skills
    for (const skillName of input.skills) {
      const cleanName = skillName.trim();
      if (cleanName.length === 0) continue;

      const skill = await prisma.skill.upsert({
        where: { name: cleanName },
        update: {},
        create: { name: cleanName },
      });

      await prisma.studentSkill.create({
        data: {
          studentId: student.id,
          skillId: skill.id,
        },
      });
    }
  }

  // Return fresh sanitized student
  return getStudentById(student.id, auth);
}

export async function addPortfolioProject(
  studentId: string,
  input: AddPortfolioInput,
  auth: AuthenticatedUser
) {
  const student = await prisma.studentProfile.findFirst({
    where: {
      OR: [{ id: studentId }, { userId: studentId }],
    },
  });

  if (!student) {
    return { error: "NOT_FOUND" as const };
  }

  const isOwner =
    auth.role === UserRole.STUDENT &&
    (auth.studentProfile?.id === student.id || auth.user.id === student.userId);

  if (!isOwner) {
    return { error: "FORBIDDEN" as const };
  }

  if (!input.title || input.title.trim().length === 0) {
    return { error: "BAD_REQUEST" as const, message: "Project title is required" };
  }

  const tags = input.tags || input.technologies || [];

  const created = await prisma.portfolioProject.create({
    data: {
      studentId: student.id,
      title: input.title.trim(),
      description: input.description?.trim() || "",
      tags,
      projectUrl: input.projectUrl?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
    },
  });

  return { project: created };
}

export async function deletePortfolioProject(
  studentId: string,
  projectId: string,
  auth: AuthenticatedUser
) {
  const student = await prisma.studentProfile.findFirst({
    where: {
      OR: [{ id: studentId }, { userId: studentId }],
    },
  });

  if (!student) {
    return { error: "NOT_FOUND" as const };
  }

  const isOwner =
    auth.role === UserRole.STUDENT &&
    (auth.studentProfile?.id === student.id || auth.user.id === student.userId);

  if (!isOwner) {
    return { error: "FORBIDDEN" as const };
  }

  const project = await prisma.portfolioProject.findUnique({
    where: { id: projectId },
  });

  if (!project || project.studentId !== student.id) {
    return { error: "NOT_FOUND" as const };
  }

  await prisma.portfolioProject.delete({
    where: { id: projectId },
  });

  return { success: true };
}
