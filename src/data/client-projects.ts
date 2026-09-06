export type ProjectStatus = "Draft" | "Open" | "In Progress" | "Completed";

export interface ClientProjectDetail {
  id: string;
  clientId?: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: string;
  duration: string;
  experienceLevel: string;
  deliverables: string[];
  deadline?: string;
  postedDate: string;
  createdAt?: string;
  applicantsCount: number;
  status: ProjectStatus;
  timelineNote?: string;
  isUserCreated?: boolean;
}

export const SEEDED_PROJECT_DETAILS: Record<string, ClientProjectDetail> = {
  "proj-1": {
    id: "proj-1",
    title: "Next.js 16 Landing Page & Brand Showcase",
    description:
      "Build an interactive, high-converting marketing landing page for a student career network with Tailwind CSS and Framer Motion. This micro-project is designed for a self-directed front-end engineering student seeking portfolio experience with modern Next.js App Router patterns.",
    category: "Web Development",
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    budget: "₹4,500",
    duration: "1 to 2 weeks",
    experienceLevel: "Intermediate",
    deliverables: [
      "Production-ready Next.js 16 App Router repository",
      "Fully responsive layout across 390px, 768px, 1024px, and 1440px",
      "Subtle micro-animations with Framer Motion with reduced motion support",
      "Deploy-ready setup on Vercel with clean Lighthouse performance",
    ],
    postedDate: "Sep 4, 2026",
    applicantsCount: 6,
    status: "Open",
    timelineNote: "Actively reviewing candidate proposals. Hiring decision expected within 48 hours.",
  },
  "proj-2": {
    id: "proj-2",
    title: "Mobile App Figma Prototype & Design System",
    description:
      "Design comprehensive UI flows, component libraries, and interactive high-fidelity prototypes for iOS and Android student freelancing app. Client provides wireframe sketches and brand color palette.",
    category: "UI/UX & Product Design",
    skills: ["Figma", "UI/UX", "Design Systems", "Prototyping"],
    budget: "₹3,500",
    duration: "1 to 2 weeks",
    experienceLevel: "Beginner / Fresher",
    deliverables: [
      "Organized Figma design file with autolayout and reusable components",
      "Interactive click-through prototype covering onboarding, project view, and apply flows",
      "Exported SVG icons and typography specs",
    ],
    postedDate: "Aug 29, 2026",
    applicantsCount: 4,
    status: "In Progress",
    timelineNote: "Milestone 1 delivered. Candidate currently revising onboarding interactive states.",
  },
  "proj-3": {
    id: "proj-3",
    title: "Full-Stack REST API & Database Schema",
    description:
      "Develop lightweight Node.js/PostgreSQL endpoints for user onboarding, project listings, and profile submissions. Complete with input validation and seed script.",
    category: "Web Development",
    skills: ["Node.js", "PostgreSQL", "REST APIs", "Prisma"],
    budget: "₹5,000",
    duration: "2 to 4 weeks",
    experienceLevel: "Advanced / Final Year",
    deliverables: [
      "Documented RESTful API endpoints with Express / Fastify",
      "Prisma ORM schema with migrations for PostgreSQL",
      "Postman / Bruno API test collection",
      "Clear README with local Docker Compose launch script",
    ],
    postedDate: "Aug 15, 2026",
    applicantsCount: 8,
    status: "Completed",
    timelineNote: "All milestones reviewed, approved, and compensation released to student.",
  },
  "proj-4": {
    id: "proj-4",
    title: "AI Prompt Optimization & Evaluation Script",
    description:
      "Python automation script to benchmark LLM extraction accuracy on unstructured resume PDFs. Includes automated evaluation metrics and structured JSON output.",
    category: "AI & Machine Learning",
    skills: ["Python", "OpenAI", "Data Analysis"],
    budget: "₹2,000",
    duration: "Less than 1 week",
    experienceLevel: "Intermediate",
    deliverables: [
      "Clean Python script with structured JSON schema output",
      "Evaluation script calculating accuracy across 20 test resumes",
      "Brief documentation and dependencies requirements file",
    ],
    postedDate: "Sep 6, 2026",
    applicantsCount: 0,
    status: "Draft",
    timelineNote: "Project saved as draft. Review requirements before publishing to public student board.",
  },
};
