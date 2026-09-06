export interface StudentProfile {
  id: string;
  name: string;
  avatarInitials: string;
  headline: string;
  college: string;
  expertise: "Web Development" | "UI/UX & Design" | "AI & Data" | "Content & Writing";
  skills: string[];
  experience: "Beginner" | "Intermediate" | "Advanced";
  availability: "Available Now" | "10-20 hrs/week" | "Part-time" | "Project-based";
  hourlyRate?: string;
  portfolioSummary: string;
  portfolioProjects: {
    title: string;
    description: string;
    tags: string[];
  }[];
  bio: string;
  joinedDate: string;
}

export const DEMO_STUDENT_TALENT: StudentProfile[] = [
  {
    id: "student-1",
    name: "Aarav Sharma",
    avatarInitials: "AS",
    headline: "Full-Stack Web & Next.js Engineer",
    college: "IIT Bombay &bull; B.Tech Computer Science (3rd Year)",
    expertise: "Web Development",
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "React", "Node.js"],
    experience: "Intermediate",
    availability: "Available Now",
    portfolioSummary: "Created responsive interactive marketing front-ends, full-stack microservices, and component libraries.",
    portfolioProjects: [
      {
        title: "Campus Resource Sharing Hub",
        description: "Built a peer-to-peer resource exchange platform using Next.js App Router and Tailwind CSS.",
        tags: ["Next.js", "Tailwind CSS", "TypeScript"],
      },
      {
        title: "DevSprint Event Tracker",
        description: "Real-time dashboard for college hackathon teams with live activity streams.",
        tags: ["React", "Node.js"],
      },
    ],
    bio: "Passionate CS student specializing in modern front-end architectures and accessible UI development. Excited to build production features for fast-moving clients.",
    joinedDate: "Aug 2026",
  },
  {
    id: "student-2",
    name: "Diya Patel",
    avatarInitials: "DP",
    headline: "Product & Interaction Designer",
    college: "NID Ahmedabad &bull; M.Des Interaction Design",
    expertise: "UI/UX & Design",
    skills: ["Figma", "UI/UX", "Design Systems", "Prototyping", "User Research"],
    experience: "Intermediate",
    availability: "10-20 hrs/week",
    portfolioSummary: "Designed 4 cross-platform mobile apps and scalable design systems with interactive micro-animations.",
    portfolioProjects: [
      {
        title: "Micro-Saving App Design Flow",
        description: "Complete UX audit, user flows, and high-fidelity clickable prototype in Figma.",
        tags: ["Figma", "Mobile UX", "Prototyping"],
      },
      {
        title: "Student Portfolio Design System",
        description: "Reusable component tokens, responsive typography hierarchy, and layout grids.",
        tags: ["Design Systems", "Figma"],
      },
    ],
    bio: "Interaction designer focused on human-centric digital interfaces, clean typography, and delightful micro-interactions.",
    joinedDate: "Jul 2026",
  },
  {
    id: "student-3",
    name: "Rohan Verma",
    avatarInitials: "RV",
    headline: "Front-End Performance & CSS Specialist",
    college: "IIT Delhi &bull; B.Tech Computer Science (3rd Year)",
    expertise: "Web Development",
    skills: ["Next.js", "Tailwind CSS", "Framer Motion", "TypeScript", "Web Performance"],
    experience: "Advanced",
    availability: "Available Now",
    portfolioSummary: "Specializes in 100/100 Lighthouse performance, zero layout shift, and smooth Framer Motion animations.",
    portfolioProjects: [
      {
        title: "Editorial Blog & Reader Experience",
        description: "Ultra-fast headless Markdown publication site with sub-second page transitions.",
        tags: ["Next.js", "Framer Motion"],
      },
    ],
    bio: "Dedicated to building web interfaces that feel instant and responsive across mobile and desktop. Experienced with modern CSS tokens and animation physics.",
    joinedDate: "Aug 2026",
  },
  {
    id: "student-4",
    name: "Siddharth Nair",
    avatarInitials: "SN",
    headline: "Systems & Backend API Developer",
    college: "IIIT Hyderabad &bull; B.Tech Computer Science (Final Year)",
    expertise: "AI & Data",
    skills: ["Python", "PostgreSQL", "Node.js", "REST APIs", "Prisma"],
    experience: "Advanced",
    availability: "Part-time",
    portfolioSummary: "Built robust relational data schemas, REST APIs, and automated data scraping / processing pipelines.",
    portfolioProjects: [
      {
        title: "FastAPI Resume Keyword Extractor",
        description: "Python async service benchmarked against 1,000 PDF resumes with JSON schema validation.",
        tags: ["Python", "FastAPI", "Data Analysis"],
      },
    ],
    bio: "Senior CS undergraduate interested in distributed systems, clean REST architectures, and high-performance database querying.",
    joinedDate: "Jun 2026",
  },
  {
    id: "student-5",
    name: "Meera Krishnan",
    avatarInitials: "MK",
    headline: "Technical Writer & Documentation Specialist",
    college: "St. Xavier's &bull; B.A. English & Media (Final Year)",
    expertise: "Content & Writing",
    skills: ["Content Writing", "Technical Documentation", "SEO", "Copywriting"],
    experience: "Beginner",
    availability: "Project-based",
    portfolioSummary: "Author of developer guides, API quickstarts, and product release notes for student developer clubs.",
    portfolioProjects: [
      {
        title: "Open Source Contributor Handbook",
        description: "Comprehensive newcomer guide explaining Git workflows and pull request standards.",
        tags: ["Documentation", "Technical Writing"],
      },
    ],
    bio: "Bridging the gap between engineering and human clarity through clear, structured documentation and engaging product copywriting.",
    joinedDate: "Sep 2026",
  },
  {
    id: "student-6",
    name: "Tanvi Rao",
    avatarInitials: "TR",
    headline: "Mobile UI Designer & Illustrator",
    college: "NID Ahmedabad &bull; B.Des Graphic & Interaction Design",
    expertise: "UI/UX & Design",
    skills: ["Figma", "UI/UX", "Brand Identity", "Illustration"],
    experience: "Beginner",
    availability: "10-20 hrs/week",
    portfolioSummary: "Created brand icon sets, onboarding illustrations, and visual style guides for consumer applications.",
    portfolioProjects: [
      {
        title: "EcoTracker Mobile Onboarding",
        description: "Vector illustrations and step-by-step onboarding walkthrough screens.",
        tags: ["Illustration", "Figma"],
      },
    ],
    bio: "Visual thinker blending illustration with functional UI design to give products unique brand personalities.",
    joinedDate: "Aug 2026",
  },
];
