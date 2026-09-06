export type ApplicantReviewStatus = "Under Review" | "Shortlisted" | "Accepted" | "Rejected";

export interface ProjectApplicant {
  id: string;
  projectId: string;
  name: string;
  avatarInitials: string;
  headline: string;
  college: string;
  relevantSkills: string[];
  portfolioSummary: string;
  portfolioUrl?: string;
  applicationMessage: string;
  demoMatchScore: string;
  appliedDate: string;
  status: ApplicantReviewStatus;
}

export const SEEDED_PROJECT_APPLICANTS: Record<string, ProjectApplicant[]> = {
  "proj-1": [
    {
      id: "app-101",
      projectId: "proj-1",
      name: "Rohan Verma",
      avatarInitials: "RV",
      headline: "Frontend Engineer & Open-source Enthusiast",
      college: "IIT Delhi &bull; B.Tech Computer Science (3rd Year)",
      relevantSkills: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
      portfolioSummary: "Built 3 production Next.js apps with smooth responsive layouts, 99+ Lighthouse performance, and Framer Motion micro-interactions.",
      portfolioUrl: "https://rohanverma.dev",
      applicationMessage: "I’ve developed multiple high-converting landing pages using Tailwind CSS and the Next.js App Router. I can deliver the clean aesthetic and responsive fidelity you need within 6 days.",
      demoMatchScore: "96%",
      appliedDate: "Sep 5, 2026",
      status: "Under Review",
    },
    {
      id: "app-102",
      projectId: "proj-1",
      name: "Ananya Deshmukh",
      avatarInitials: "AD",
      headline: "UI Designer & Web Developer",
      college: "BITS Pilani &bull; B.E. Computer Science (Final Year)",
      relevantSkills: ["Next.js", "React", "Tailwind CSS", "Figma"],
      portfolioSummary: "Designed and built design system foundations, landing pages, and accessible interactive components.",
      portfolioUrl: "https://ananyadesign.work",
      applicationMessage: "My background in both UI design and React development enables me to translate Figma layouts into pixel-perfect, accessible code with zero layout shift.",
      demoMatchScore: "93%",
      appliedDate: "Sep 5, 2026",
      status: "Shortlisted",
    },
    {
      id: "app-103",
      projectId: "proj-1",
      name: "Karan Singhal",
      avatarInitials: "KS",
      headline: "Full-Stack Student Developer",
      college: "NIT Trichy &bull; B.Tech Information Technology (2nd Year)",
      relevantSkills: ["React", "Tailwind CSS", "JavaScript"],
      portfolioSummary: "Experienced in responsive web development, portfolio showcase projects, and modern CSS layouts.",
      portfolioUrl: "https://github.com/karansinghal",
      applicationMessage: "Eager to contribute to this showcase project. I have hands-on experience with Tailwind and React component design.",
      demoMatchScore: "87%",
      appliedDate: "Sep 6, 2026",
      status: "Under Review",
    },
  ],
  "proj-2": [
    {
      id: "app-201",
      projectId: "proj-2",
      name: "Tanvi Rao",
      avatarInitials: "TR",
      headline: "Product Designer & Visual Stylist",
      college: "NID Ahmedabad &bull; M.Des Interaction Design",
      relevantSkills: ["Figma", "UI/UX", "Design Systems", "Prototyping"],
      portfolioSummary: "Created multi-platform design systems and complete mobile app design flows with interactive Figma prototypes.",
      portfolioUrl: "https://tanvirao.design",
      applicationMessage: "I specialize in clean, Apple-inspired mobile interfaces. I can organize your component library and deliver high-fidelity prototypes in 7 days.",
      demoMatchScore: "95%",
      appliedDate: "Aug 30, 2026",
      status: "Accepted",
    },
    {
      id: "app-202",
      projectId: "proj-2",
      name: "Dev Mehta",
      avatarInitials: "DM",
      headline: "UI/UX Student Designer",
      college: "IIT Bombay &bull; IDC School of Design (2nd Year)",
      relevantSkills: ["Figma", "Prototyping", "Wireframing"],
      portfolioSummary: "Portfolio includes student project mockups, wireframing case studies, and user testing documentation.",
      portfolioUrl: "https://behance.net/devmehta",
      applicationMessage: "Excited about this project. I work extensively in Figma with autolayout and design tokens.",
      demoMatchScore: "89%",
      appliedDate: "Sep 1, 2026",
      status: "Under Review",
    },
  ],
  "proj-3": [
    {
      id: "app-301",
      projectId: "proj-3",
      name: "Siddharth Nair",
      avatarInitials: "SN",
      headline: "Backend & Systems Developer",
      college: "IIIT Hyderabad &bull; B.Tech Computer Science (Final Year)",
      relevantSkills: ["Node.js", "PostgreSQL", "REST APIs", "Prisma"],
      portfolioSummary: "Authored high-throughput REST APIs, database schemas, and automated test pipelines using Node.js and PostgreSQL.",
      portfolioUrl: "https://github.com/siddharthnair",
      applicationMessage: "Completed the REST endpoints, schema migrations, and documentation with 100% test coverage.",
      demoMatchScore: "98%",
      appliedDate: "Aug 16, 2026",
      status: "Accepted",
    },
  ],
  "proj-4": [],
};
