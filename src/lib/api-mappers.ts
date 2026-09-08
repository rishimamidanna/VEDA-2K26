import type {
  Project,
  ProjectStatus,
  Application,
  ApplicationStatus,
  WorkProject,
  WorkStatus,
} from "@/types";

export function formatPrismaProjectStatus(status: string): ProjectStatus {
  switch (status?.toUpperCase()) {
    case "OPEN":
      return "Open";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CLOSED":
      return "Closed";
    case "DRAFT":
      return "Draft";
    default:
      return "Open";
  }
}

export function formatPrismaApplicationStatus(status: string): ApplicationStatus {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "Pending";
    case "UNDER_REVIEW":
      return "Under Review";
    case "SHORTLISTED":
      return "Shortlisted";
    case "ACCEPTED":
      return "Accepted";
    case "REJECTED":
      return "Rejected";
    case "WITHDRAWN":
      return "Withdrawn";
    default:
      return "Pending";
  }
}

export function formatPrismaWorkStatus(status: string): WorkStatus {
  switch (status?.toUpperCase()) {
    case "IN_PROGRESS":
      return "In Progress";
    case "AWAITING_REVIEW":
      return "Awaiting Review";
    case "COMPLETED":
      return "Completed";
    default:
      return "In Progress";
  }
}

export function mapProject(dbProject: any): Project {
  if (!dbProject) return null as any;

  const skills: string[] = Array.isArray(dbProject.skills)
    ? dbProject.skills.map((s: any) =>
        typeof s === "string" ? s : s.skill?.name || s.name || "Skill"
      )
    : [];

  const applicantsCount =
    dbProject._count?.applications ?? dbProject.applicantsCount ?? 0;

  return {
    id: dbProject.id,
    clientId: dbProject.clientId,
    title: dbProject.title,
    description: dbProject.description,
    fullDescription: dbProject.fullDescription || dbProject.description,
    deliverables: Array.isArray(dbProject.deliverables)
      ? dbProject.deliverables
      : [],
    category: dbProject.category || "General",
    budgetValue: dbProject.budgetValue ?? 5000,
    budget: dbProject.budget?.startsWith("₹")
      ? dbProject.budget
      : `₹${dbProject.budget || dbProject.budgetValue || "5,000"}`,
    duration: dbProject.duration || "2 weeks",
    durationWeeks: dbProject.durationWeeks ?? 2,
    deadline: dbProject.deadline || undefined,
    skills,
    experienceLevel: dbProject.experienceLevel || "Intermediate",
    status: formatPrismaProjectStatus(dbProject.status),
    postedAt: dbProject.createdAt
      ? new Date(dbProject.createdAt).toISOString()
      : new Date().toISOString(),
    createdAt: dbProject.createdAt
      ? new Date(dbProject.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: dbProject.updatedAt
      ? new Date(dbProject.updatedAt).toISOString()
      : new Date().toISOString(),
    applicantsCount,
    isUserCreated: dbProject.isUserCreated ?? true,
    matchPercentage: dbProject.matchPercentage ?? 92,
    client: dbProject.client?.companyName || "SkillBridge Partner",
    clientDetails: {
      type: dbProject.client?.industry || "Technology Company",
      location: dbProject.client?.location || "Remote",
      projectsPosted: dbProject.client?.projectsPostedCount ?? 1,
      studentsHired: dbProject.client?.studentsHiredCount ?? 0,
      rating: dbProject.client?.rating ?? 4.9,
    },
  };
}

export function mapApplication(dbApp: any): Application {
  if (!dbApp) return null as any;

  const studentName =
    dbApp.student?.user?.name || dbApp.name || "Student Applicant";
  const avatarInitials =
    dbApp.avatarInitials ||
    studentName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const skills: string[] = Array.isArray(dbApp.student?.skills)
    ? dbApp.student.skills.map((s: any) => s.skill?.name || s.name || s)
    : dbApp.relevantSkills || [];

  return {
    id: dbApp.id,
    projectId: dbApp.projectId,
    studentId: dbApp.studentId,
    status: formatPrismaApplicationStatus(dbApp.status),
    proposal: dbApp.proposal || "",
    proposedBudget: dbApp.proposedBudget || undefined,
    estimatedCompletion: dbApp.estimatedCompletion || undefined,
    appliedAt: dbApp.appliedAt
      ? new Date(dbApp.appliedAt).toISOString()
      : new Date().toISOString(),
    updatedAt: dbApp.updatedAt
      ? new Date(dbApp.updatedAt).toISOString()
      : new Date().toISOString(),
    name: studentName,
    avatarInitials,
    headline: dbApp.student?.headline || dbApp.headline || "Student Builder",
    college: dbApp.student?.college || dbApp.college || "University",
    relevantSkills: skills,
    portfolioSummary:
      dbApp.student?.portfolio?.[0]?.description ||
      dbApp.portfolioSummary ||
      "Active student portfolio on SkillBridge",
    portfolioUrl: dbApp.student?.portfolio?.[0]?.liveUrl || dbApp.portfolioUrl,
    demoMatchScore: dbApp.demoMatchScore || "94%",
    isUserCreated: dbApp.isUserCreated ?? true,
  };
}

export function mapWorkContract(
  dbContract: any,
  fallbackProject?: any
): WorkProject & { project: Project } {
  if (!dbContract) return null as any;

  const project = mapProject(dbContract.project || fallbackProject);

  return {
    id: dbContract.id,
    projectId: dbContract.projectId,
    studentId: dbContract.studentId,
    clientId: dbContract.clientId,
    status: formatPrismaWorkStatus(dbContract.status),
    progress: dbContract.progress ?? 0,
    startDate: dbContract.createdAt
      ? new Date(dbContract.createdAt).toISOString()
      : new Date().toISOString(),
    completedAt:
      dbContract.status === "COMPLETED" && dbContract.updatedAt
        ? new Date(dbContract.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : undefined,
    earnings: project.budget || undefined,
    lastActivity:
      dbContract.lastActivity || "Work contract active and in progress",
    milestones: [
      {
        id: `ms-1-${dbContract.id}`,
        title: "Project Kickoff & Setup",
        status: dbContract.progress > 20 ? "Completed" : "In Progress",
      },
      {
        id: `ms-2-${dbContract.id}`,
        title: "Core Implementation",
        status:
          dbContract.progress >= 80
            ? "Completed"
            : dbContract.progress > 20
            ? "In Progress"
            : "Not Started",
      },
      {
        id: `ms-3-${dbContract.id}`,
        title: "Final Review & Handover",
        status: dbContract.progress === 100 ? "Completed" : "Not Started",
      },
    ],
    deliverables: (project.deliverables || [
      "Completed codebase and deliverables",
    ]).map((deliv, idx) => ({
      id: `deliv-${idx}-${dbContract.id}`,
      title: deliv,
      status: dbContract.progress === 100 ? "Completed" : "Pending",
    })),
    recentActivity: [
      {
        id: `act-${dbContract.id}-1`,
        type: "note",
        content:
          dbContract.lastActivity ||
          "Contract initiated upon application acceptance.",
        timestamp: dbContract.updatedAt
          ? new Date(dbContract.updatedAt).toISOString()
          : new Date().toISOString(),
      },
    ],
    project,
  };
}

export function mapTalentStudent(dbStudent: any) {
  if (!dbStudent) return null as any;

  const skills: string[] = Array.isArray(dbStudent.skills)
    ? dbStudent.skills.map((s: any) => s.name || s.skill?.name || s)
    : [];

  const portfolioProjects = Array.isArray(dbStudent.portfolio)
    ? dbStudent.portfolio.map((p: any) => ({
        title: p.title,
        description: p.description,
        tags: p.tags || [],
      }))
    : [];

  const name = dbStudent.name || dbStudent.user?.name || "Student";
  const avatarInitials =
    dbStudent.avatarInitials ||
    dbStudent.avatar ||
    name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return {
    id: dbStudent.id,
    name,
    avatarInitials,
    headline: dbStudent.headline || "Student Freelancer",
    college: dbStudent.college || "University",
    expertise: (dbStudent.expertise || "Web Development") as any,
    skills,
    experience: (dbStudent.experienceLevel || "Intermediate") as any,
    availability: (dbStudent.availability || "Available Now") as any,
    hourlyRate: dbStudent.hourlyRate || "₹500/hr",
    portfolioSummary:
      portfolioProjects[0]?.description ||
      dbStudent.about ||
      "Active student portfolio on SkillBridge",
    portfolioProjects,
    bio: dbStudent.about || "Passionate student builder specializing in software development.",
    isPublic: typeof dbStudent.isPublic === "boolean" ? dbStudent.isPublic : true,
    joinedDate: dbStudent.createdAt
      ? new Date(dbStudent.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "Aug 2026",
  };
}

export function mapStudentProfile(dbStudent: any) {
  if (!dbStudent) return null as any;

  const skills: string[] = Array.isArray(dbStudent.skills)
    ? dbStudent.skills.map((s: any) => s.name || s.skill?.name || s)
    : [];

  const primarySkills = skills.slice(0, 4);
  const additionalSkills = skills.slice(4);

  const portfolio = Array.isArray(dbStudent.portfolio)
    ? dbStudent.portfolio.map((p: any) => ({
        id: p.id,
        studentId: p.studentId || dbStudent.id,
        title: p.title,
        description: p.description,
        technologies: p.tags || [],
        tags: p.tags || [],
        projectType: "Personal Project",
        githubUrl: p.projectUrl || undefined,
        demoUrl: p.projectUrl || undefined,
      }))
    : [];

  const name = dbStudent.name || dbStudent.user?.name || "Student";
  const avatarInitials =
    dbStudent.avatarInitials ||
    dbStudent.avatar ||
    name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return {
    id: dbStudent.id,
    userId: dbStudent.userId,
    name,
    avatarInitials,
    headline: dbStudent.headline || "Frontend Developer & Computer Science Student",
    about: dbStudent.about || "Passionate software developer on SkillBridge.",
    bio: dbStudent.about || "Passionate software developer on SkillBridge.",
    location: dbStudent.location || "Bengaluru, India",
    college: dbStudent.college || "University",
    availability: dbStudent.availability || "Available for freelance projects",
    hourlyRate: dbStudent.hourlyRate || "₹500/hr",
    completionPercentage: dbStudent.profileStrength ?? 86,
    isPublic: typeof dbStudent.isPublic === "boolean" ? dbStudent.isPublic : true,
    joinedDate: dbStudent.createdAt
      ? new Date(dbStudent.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "Aug 2026",
    expertise: dbStudent.expertise || "Web Development",
    primarySkills: primarySkills.length > 0 ? primarySkills : ["React", "TypeScript", "Next.js"],
    additionalSkills: additionalSkills.length > 0 ? additionalSkills : ["Tailwind CSS", "Node.js"],
    skillProfile: [
      { category: "Frontend Development", score: 92 },
      { category: "Backend Development", score: 74 },
      { category: "Data & Analytics", score: 81 },
      { category: "UI/UX", score: 68 },
    ],
    experience: [
      {
        id: "exp_1",
        role: "Frontend Developer",
        company: "SkillBridge Projects",
        duration: "2026 – Present",
        description: "Worked on responsive web applications and real-world client projects.",
      },
    ],
    education: [
      {
        id: "edu_1",
        degree: "B.Tech – Computer Science",
        institution: dbStudent.college || "University",
        duration: "2024 – 2028",
      },
    ],
    portfolioSummary: portfolio[0]?.description || "Portfolio projects built by student.",
    portfolio,
    stats: {
      projectsCompleted: dbStudent.stats?.projectsCompleted ?? 0,
      projectsInProgress: dbStudent.stats?.projectsInProgress ?? 0,
      clientRating: dbStudent.stats?.clientRating ?? 4.9,
      profileViews: dbStudent.stats?.profileViews ?? 124,
    },
  };
}
