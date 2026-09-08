import { PrismaClient, UserRole, ProjectStatus, ApplicationStatus, WorkStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SkillBridge database seed...");

  const studentPasswordHash = await bcrypt.hash("Student123!", 10);
  const clientPasswordHash = await bcrypt.hash("Client123!", 10);

  // 1. Seed Demo Student User & Profile
  const studentUser = await prisma.user.upsert({
    where: { email: "alex.johnson@university.edu" },
    update: {
      name: "Alex Johnson",
      role: UserRole.STUDENT,
      passwordHash: studentPasswordHash,
    },
    create: {
      id: "user-student-1",
      email: "alex.johnson@university.edu",
      name: "Alex Johnson",
      passwordHash: studentPasswordHash,
      role: UserRole.STUDENT,
      avatar: "AJ",
    },
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: { id: "student-1" },
    update: {
      userId: studentUser.id,
      headline: "Full-Stack Web & Next.js Engineer",
      college: "IIT Bombay • B.Tech Computer Science (3rd Year)",
      expertise: "Web Development",
      experienceLevel: "Intermediate",
      availability: "Available Now",
      hourlyRate: "₹500/hr",
      profileStrength: 86,
    },
    create: {
      id: "student-1",
      userId: studentUser.id,
      headline: "Full-Stack Web & Next.js Engineer",
      about: "Passionate CS student specializing in modern front-end architectures and accessible UI development.",
      college: "IIT Bombay • B.Tech Computer Science (3rd Year)",
      location: "Mumbai, India",
      expertise: "Web Development",
      experienceLevel: "Intermediate",
      availability: "Available Now",
      hourlyRate: "₹500/hr",
      profileStrength: 86,
    },
  });

  // 2. Seed Demo Client User & Profile
  const clientUser = await prisma.user.upsert({
    where: { email: "client@skillbridge.co" },
    update: {
      name: "Rishi Mamidanna",
      role: UserRole.CLIENT,
      passwordHash: clientPasswordHash,
    },
    create: {
      id: "user-client-1",
      email: "client@skillbridge.co",
      name: "Rishi Mamidanna",
      passwordHash: clientPasswordHash,
      role: UserRole.CLIENT,
      avatar: "RM",
    },
  });

  const clientProfile = await prisma.clientProfile.upsert({
    where: { id: "client-1" },
    update: {
      userId: clientUser.id,
      companyName: "Veda Studios",
      industry: "Digital Media & Technology",
      description: "High-growth digital product incubator hiring top engineering students.",
      location: "Bengaluru, India",
    },
    create: {
      id: "client-1",
      userId: clientUser.id,
      companyName: "Veda Studios",
      industry: "Digital Media & Technology",
      description: "High-growth digital product incubator hiring top engineering students.",
      location: "Bengaluru, India",
      rating: 4.9,
      projectsPostedCount: 12,
      studentsHiredCount: 8,
    },
  });

  // 3. Seed Skills
  const coreSkills = [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Node.js",
    "Python",
    "FastAPI",
    "OpenAI",
    "Figma",
    "UI/UX",
    "SQL",
    "PostgreSQL",
    "Prisma",
    "Automation",
    "Technical Writing",
    "Framer Motion",
    "React Native",
    "Expo",
    "Scikit-learn",
    "Design Systems",
    "Prototyping",
    "User Research",
    "Web Performance",
    "SEO",
    "Developer Docs",
    "Content Strategy",
    "Redis",
  ];

  const skillRecords: Record<string, string> = {};
  for (const skillName of coreSkills) {
    const skill = await prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName },
    });
    skillRecords[skillName] = skill.id;
  }

  // 4. Seed Student Skills
  const studentSkillNames = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js"];
  for (const name of studentSkillNames) {
    const skillId = skillRecords[name];
    if (skillId) {
      await prisma.studentSkill.upsert({
        where: {
          studentId_skillId: {
            studentId: studentProfile.id,
            skillId: skillId,
          },
        },
        update: {},
        create: {
          studentId: studentProfile.id,
          skillId: skillId,
        },
      });
    }
  }

  // 5. Seed Portfolio Projects
  const portfolioProjects = [
    {
      id: "portfolio-1",
      title: "Campus Resource Sharing Hub",
      description: "Built a peer-to-peer resource exchange platform using Next.js App Router and Tailwind CSS.",
      tags: ["Next.js", "Tailwind CSS", "TypeScript"],
    },
    {
      id: "portfolio-2",
      title: "DevSprint Event Tracker",
      description: "Real-time dashboard for college hackathon teams with live activity streams.",
      tags: ["React", "Node.js"],
    },
  ];

  for (const port of portfolioProjects) {
    await prisma.portfolioProject.upsert({
      where: { id: port.id },
      update: {
        title: port.title,
        description: port.description,
        tags: port.tags,
      },
      create: {
        id: port.id,
        studentId: studentProfile.id,
        title: port.title,
        description: port.description,
        tags: port.tags,
      },
    });
  }

  // 5.1 Seed Additional Talent Directory Students
  const additionalStudents = [
    {
      id: "student-2",
      userId: "user-student-2",
      email: "diya.patel@design.edu",
      name: "Diya Patel",
      avatar: "DP",
      headline: "Product & Interaction Designer",
      about: "Interaction designer focused on human-centric digital interfaces, clean typography, and delightful micro-interactions.",
      college: "NID Ahmedabad • M.Des Interaction Design",
      location: "Ahmedabad, India",
      expertise: "UI/UX & Design",
      experienceLevel: "Intermediate",
      availability: "10-20 hrs/week",
      hourlyRate: "₹650/hr",
      profileStrength: 92,
      skills: ["Figma", "UI/UX", "Design Systems", "Prototyping", "User Research"],
      portfolio: [
        {
          id: "portfolio-3",
          title: "Micro-Saving App Design Flow",
          description: "Complete UX audit, user flows, and high-fidelity clickable prototype in Figma.",
          tags: ["Figma", "Mobile UX", "Prototyping"],
        },
        {
          id: "portfolio-4",
          title: "Student Portfolio Design System",
          description: "Reusable component tokens, responsive typography hierarchy, and layout grids.",
          tags: ["Design Systems", "Figma"],
        },
      ],
    },
    {
      id: "student-3",
      userId: "user-student-3",
      email: "rohan.verma@university.edu",
      name: "Rohan Verma",
      avatar: "RV",
      headline: "Front-End Performance & CSS Specialist",
      about: "Dedicated to building web interfaces that feel instant and responsive across mobile and desktop. Experienced with modern CSS tokens and animation physics.",
      college: "IIT Delhi • B.Tech Computer Science (3rd Year)",
      location: "New Delhi, India",
      expertise: "Web Development",
      experienceLevel: "Advanced",
      availability: "Available Now",
      hourlyRate: "₹750/hr",
      profileStrength: 95,
      skills: ["Next.js", "Tailwind CSS", "Framer Motion", "TypeScript", "Web Performance"],
      portfolio: [
        {
          id: "portfolio-5",
          title: "Editorial Blog & Reader Experience",
          description: "Ultra-fast headless Markdown publication site with sub-second page transitions.",
          tags: ["Next.js", "Framer Motion"],
        },
      ],
    },
    {
      id: "student-4",
      userId: "user-student-4",
      email: "siddharth.nair@university.edu",
      name: "Siddharth Nair",
      avatar: "SN",
      headline: "Systems & Backend API Developer",
      about: "Passionate about high-throughput distributed systems, reliable relational database design, and asynchronous queue workers.",
      college: "BITS Pilani • B.E. Computer Science",
      location: "Hyderabad, India",
      expertise: "AI & Data",
      experienceLevel: "Advanced",
      availability: "Project-based",
      hourlyRate: "₹800/hr",
      profileStrength: 90,
      skills: ["Node.js", "Python", "FastAPI", "SQL", "PostgreSQL", "Prisma"],
      portfolio: [
        {
          id: "portfolio-6",
          title: "Async Notification Dispatch Engine",
          description: "Redis-backed rate-limited notification microservice handling 10k messages/sec.",
          tags: ["Python", "FastAPI", "Redis"],
        },
      ],
    },
    {
      id: "student-5",
      userId: "user-student-5",
      email: "ananya.sen@university.edu",
      name: "Ananya Sen",
      avatar: "AS",
      headline: "Technical Writer & Product Marketer",
      about: "Bridges the gap between complex engineering architectures and intuitive developer documentation.",
      college: "Ashoka University • B.A. English & Computer Science",
      location: "Kolkata, India",
      expertise: "Content & Writing",
      experienceLevel: "Intermediate",
      availability: "Part-time",
      hourlyRate: "₹450/hr",
      profileStrength: 88,
      skills: ["Technical Writing", "SEO", "Developer Docs", "Content Strategy"],
      portfolio: [
        {
          id: "portfolio-7",
          title: "Cloud API Developer Guide",
          description: "Comprehensive multi-version developer portal documentation with live code snippets.",
          tags: ["Technical Writing", "Developer Docs"],
        },
      ],
    },
    {
      id: "student-6",
      userId: "user-student-6",
      email: "kavya.reddy@university.edu",
      name: "Kavya Reddy",
      avatar: "KR",
      headline: "Cross-Platform Mobile Engineer",
      about: "Builds high-performance native-feeling cross-platform iOS and Android applications with offline-first sync.",
      college: "IIT Madras • B.Tech Electrical Engineering",
      location: "Chennai, India",
      expertise: "Web Development",
      experienceLevel: "Intermediate",
      availability: "Available Now",
      hourlyRate: "₹600/hr",
      profileStrength: 91,
      skills: ["React Native", "Expo", "TypeScript", "React", "Tailwind CSS"],
      portfolio: [
        {
          id: "portfolio-8",
          title: "Offline-First Habit Tracker",
          description: "WatermelonDB and React Native mobile application with biometric lock and encrypted local storage.",
          tags: ["React Native", "Expo", "TypeScript"],
        },
      ],
    },
  ];

  for (const s of additionalStudents) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        avatar: s.avatar,
        role: UserRole.STUDENT,
        passwordHash: studentPasswordHash,
      },
      create: {
        id: s.userId,
        email: s.email,
        name: s.name,
        avatar: s.avatar,
        passwordHash: studentPasswordHash,
        role: UserRole.STUDENT,
      },
    });

    const prof = await prisma.studentProfile.upsert({
      where: { id: s.id },
      update: {
        userId: user.id,
        headline: s.headline,
        about: s.about,
        college: s.college,
        location: s.location,
        expertise: s.expertise,
        experienceLevel: s.experienceLevel,
        availability: s.availability,
        hourlyRate: s.hourlyRate,
        profileStrength: s.profileStrength,
      },
      create: {
        id: s.id,
        userId: user.id,
        headline: s.headline,
        about: s.about,
        college: s.college,
        location: s.location,
        expertise: s.expertise,
        experienceLevel: s.experienceLevel,
        availability: s.availability,
        hourlyRate: s.hourlyRate,
        profileStrength: s.profileStrength,
      },
    });

    for (const skillName of s.skills) {
      const skillId = skillRecords[skillName];
      if (skillId) {
        await prisma.studentSkill.upsert({
          where: {
            studentId_skillId: {
              studentId: prof.id,
              skillId: skillId,
            },
          },
          update: {},
          create: {
            studentId: prof.id,
            skillId: skillId,
          },
        });
      }
    }

    for (const port of s.portfolio) {
      await prisma.portfolioProject.upsert({
        where: { id: port.id },
        update: {
          title: port.title,
          description: port.description,
          tags: port.tags,
        },
        create: {
          id: port.id,
          studentId: prof.id,
          title: port.title,
          description: port.description,
          tags: port.tags,
        },
      });
    }
  }

  // 6. Seed Projects
  const projectsData = [
    {
      id: "1",
      title: "React Analytics Dashboard",
      description: "Build a responsive analytics dashboard for a growing SaaS startup. Includes charts, KPI cards, and real-time data visualisation components.",
      category: "Web Development",
      budget: "₹9,000",
      budgetValue: 9000,
      duration: "2 weeks",
      durationWeeks: 2,
      experienceLevel: "Intermediate",
      deliverables: ["Responsive analytics dashboard", "Reusable dashboard components", "Clean documented source code"],
      status: ProjectStatus.OPEN,
      skills: ["React", "TypeScript", "Next.js"],
    },
    {
      id: "2",
      title: "E-commerce Landing Page",
      description: "Create a high-converting product landing page for a D2C skincare brand. Must include animations, product showcase, and a checkout CTA.",
      category: "Web Development",
      budget: "₹6,000",
      budgetValue: 6000,
      duration: "2 weeks",
      durationWeeks: 2,
      experienceLevel: "Beginner",
      deliverables: ["Single page landing page implementation", "Scroll animations", "Lighthouse 90+"],
      status: ProjectStatus.OPEN,
      skills: ["React", "Tailwind CSS", "Figma"],
    },
    {
      id: "3",
      title: "Python Automation Tool",
      description: "Automate repetitive data-entry tasks using a Python script that integrates with Google Sheets and Notion via their APIs.",
      category: "Automation",
      budget: "₹4,500",
      budgetValue: 4500,
      duration: "1 week",
      durationWeeks: 1,
      experienceLevel: "Intermediate",
      deliverables: ["Python automation script", "API integrations", "Error handling"],
      status: ProjectStatus.CLOSED,
      skills: ["Python", "Automation"],
    },
    {
      id: "4",
      title: "Mobile App UI Redesign",
      description: "Redesign the user interface for a fintech mobile app targeting Gen Z users. Deliver high-fidelity Figma screens for iOS and Android.",
      category: "UI/UX Design",
      budget: "₹12,000",
      budgetValue: 12000,
      duration: "3 weeks",
      durationWeeks: 3,
      experienceLevel: "Intermediate",
      deliverables: ["Figma design file", "High-fidelity mockups", "Interactive prototype"],
      status: ProjectStatus.OPEN,
      skills: ["Figma", "UI/UX"],
    },
    {
      id: "5",
      title: "AI Chatbot Integration",
      description: "Integrate an LLM-powered chatbot into an existing customer support portal using FastAPI and OpenAI API. Include conversation history and streaming responses.",
      category: "AI/ML",
      budget: "₹18,000",
      budgetValue: 18000,
      duration: "4 weeks",
      durationWeeks: 4,
      experienceLevel: "Advanced",
      deliverables: ["FastAPI microservice", "OpenAI integration", "Streaming response UI"],
      status: ProjectStatus.OPEN,
      skills: ["Python", "FastAPI", "OpenAI"],
    },
  ];

  for (const p of projectsData) {
    const project = await prisma.project.upsert({
      where: { id: p.id },
      update: {
        title: p.title,
        description: p.description,
        category: p.category,
        budget: p.budget,
        budgetValue: p.budgetValue,
        duration: p.duration,
        durationWeeks: p.durationWeeks,
        experienceLevel: p.experienceLevel,
        deliverables: p.deliverables,
        status: p.status,
      },
      create: {
        id: p.id,
        clientId: clientProfile.id,
        title: p.title,
        description: p.description,
        category: p.category,
        budget: p.budget,
        budgetValue: p.budgetValue,
        duration: p.duration,
        durationWeeks: p.durationWeeks,
        experienceLevel: p.experienceLevel,
        deliverables: p.deliverables,
        status: p.status,
      },
    });

    // Link Project Skills
    for (const skillName of p.skills) {
      const skillId = skillRecords[skillName];
      if (skillId) {
        await prisma.projectSkill.upsert({
          where: {
            projectId_skillId: {
              projectId: project.id,
              skillId: skillId,
            },
          },
          update: {},
          create: {
            projectId: project.id,
            skillId: skillId,
          },
        });
      }
    }
  }

  // 7. Seed Applications (idempotent, respecting unique [projectId, studentId])
  const applicationsData = [
    {
      id: "app-1",
      projectId: "1",
      studentId: studentProfile.id,
      status: ApplicationStatus.SHORTLISTED,
      proposal: "I have extensive experience building React dashboards with Recharts and Tailwind CSS.",
      proposedBudget: "₹9,000",
      estimatedCompletion: "2 weeks",
    },
    {
      id: "app-2",
      projectId: "2",
      studentId: studentProfile.id,
      status: ApplicationStatus.PENDING,
      proposal: "I specialize in high-converting landing pages with 90+ Lighthouse scores.",
      proposedBudget: "₹5,500",
      estimatedCompletion: "1 week",
    },
    {
      id: "app-3",
      projectId: "3",
      studentId: studentProfile.id,
      status: ApplicationStatus.REJECTED,
      proposal: "I can write a clean Python script using Notion and Google APIs.",
      proposedBudget: "₹4,000",
      estimatedCompletion: "1 week",
    },
    {
      id: "app-4",
      projectId: "5",
      studentId: studentProfile.id,
      status: ApplicationStatus.ACCEPTED,
      proposal: "I have integrated OpenAI API into customer service workflows previously with FastAPI.",
      proposedBudget: "₹18,000",
      estimatedCompletion: "3 weeks",
    },
  ];

  for (const app of applicationsData) {
    const application = await prisma.application.upsert({
      where: {
        projectId_studentId: {
          projectId: app.projectId,
          studentId: app.studentId,
        },
      },
      update: {
        status: app.status,
        proposal: app.proposal,
        proposedBudget: app.proposedBudget,
        estimatedCompletion: app.estimatedCompletion,
      },
      create: {
        id: app.id,
        projectId: app.projectId,
        studentId: app.studentId,
        status: app.status,
        proposal: app.proposal,
        proposedBudget: app.proposedBudget,
        estimatedCompletion: app.estimatedCompletion,
      },
    });

    // 8. Seed WorkContract for Accepted application
    if (app.status === ApplicationStatus.ACCEPTED) {
      await prisma.workContract.upsert({
        where: { applicationId: application.id },
        update: {
          status: WorkStatus.IN_PROGRESS,
          progress: 68,
        },
        create: {
          id: "work-contract-1",
          applicationId: application.id,
          projectId: app.projectId,
          studentId: app.studentId,
          clientId: clientProfile.id,
          status: WorkStatus.IN_PROGRESS,
          progress: 68,
          lastActivity: "Client reviewed latest update",
        },
      });
    }
  }

  // 9. Seed Conversations & Messages
  const conversationsData = [
    {
      id: "conv-1",
      studentId: studentProfile.id,
      clientId: clientProfile.id,
      projectId: "1",
      messages: [
        {
          id: "msg-1",
          senderId: clientUser.id,
          content: "Hi Alex! The dashboard is looking really good. Could you make the revenue chart slightly easier to read on mobile devices?",
          readAt: new Date(Date.now() - 4 * 3600 * 1000),
          createdAt: new Date(Date.now() - 5 * 3600 * 1000),
        },
        {
          id: "msg-2",
          senderId: studentUser.id,
          content: "Sure, I'll adjust the chart layout and test it on smaller screens. Should take a couple of hours.",
          readAt: new Date(Date.now() - 3 * 3600 * 1000),
          createdAt: new Date(Date.now() - 4 * 3600 * 1000),
        },
        {
          id: "msg-3",
          senderId: clientUser.id,
          content: "Perfect. Also, please make sure the tooltip doesn't overflow on mobile — it was cutting off on the right side.",
          readAt: new Date(Date.now() - 2 * 3600 * 1000),
          createdAt: new Date(Date.now() - 3 * 3600 * 1000),
        },
        {
          id: "msg-4",
          senderId: studentUser.id,
          content: "Got it. I'll fix the tooltip overflow and add a media query for mobile. I'll push an update by end of day.",
          readAt: new Date(Date.now() - 1 * 3600 * 1000),
          createdAt: new Date(Date.now() - 2 * 3600 * 1000),
        },
        {
          id: "msg-5",
          senderId: studentUser.id,
          content: "Here's the updated build with both fixes applied.",
          attachmentName: "dashboard-v3.zip",
          attachmentSize: "2.4 MB",
          readAt: new Date(Date.now() - 30 * 60 * 1000),
          createdAt: new Date(Date.now() - 1 * 3600 * 1000),
        },
        {
          id: "msg-6",
          senderId: clientUser.id,
          content: "Can you share the latest dashboard build?",
          readAt: null, // Unread by student
          createdAt: new Date(Date.now() - 15 * 60 * 1000),
        },
        {
          id: "msg-7",
          senderId: clientUser.id,
          content: "Also want to double-check the KPI cards — are they responsive on tablets too?",
          readAt: null, // Unread by student
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
        },
      ],
    },
    {
      id: "conv-2",
      studentId: studentProfile.id,
      clientId: clientProfile.id,
      projectId: "5",
      messages: [
        {
          id: "msg-8",
          senderId: clientUser.id,
          content: "Alex, the chatbot integration is coming along well. Can you check the API fallback and make sure it handles edge cases gracefully?",
          readAt: new Date(Date.now() - 24 * 3600 * 1000),
          createdAt: new Date(Date.now() - 25 * 3600 * 1000),
        },
        {
          id: "msg-9",
          senderId: studentUser.id,
          content: "Yes, I'll add a fallback response for undefined intents and test the edge cases today.",
          readAt: new Date(Date.now() - 20 * 3600 * 1000),
          createdAt: new Date(Date.now() - 23 * 3600 * 1000),
        },
        {
          id: "msg-10",
          senderId: clientUser.id,
          content: "Great. Also ensure setup instructions are included in the final documentation.",
          readAt: new Date(Date.now() - 18 * 3600 * 1000),
          createdAt: new Date(Date.now() - 19 * 3600 * 1000),
        },
      ],
    },
  ];

  for (const c of conversationsData) {
    const conversation = await prisma.conversation.upsert({
      where: {
        studentId_clientId_projectId: {
          studentId: c.studentId,
          clientId: c.clientId,
          projectId: c.projectId,
        },
      },
      update: {},
      create: {
        id: c.id,
        studentId: c.studentId,
        clientId: c.clientId,
        projectId: c.projectId,
      },
    });

    for (const m of c.messages) {
      await prisma.message.upsert({
        where: { id: m.id },
        update: {
          content: m.content,
          readAt: m.readAt,
        },
        create: {
          id: m.id,
          conversationId: conversation.id,
          senderId: m.senderId,
          content: m.content,
          attachmentName: m.attachmentName,
          attachmentSize: m.attachmentSize,
          readAt: m.readAt,
          createdAt: m.createdAt,
        },
      });
    }
  }

  console.log("✅ SkillBridge database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
