import type { Application } from "@/types";
import { allProjects } from "./projects";

export const allApplications: Application[] = [
  {
    id: "app_1",
    projectId: "1", // React Analytics Dashboard
    status: "Shortlisted",
    appliedAt: "2 days ago",
    proposal: "I have extensive experience building React dashboards with Recharts and Tailwind CSS. I've previously built a similar analytics platform for a local SaaS startup and can ensure high performance and mobile responsiveness.",
    proposedBudget: "₹9,000",
    estimatedCompletion: "2 weeks",
  },
  {
    id: "app_2",
    projectId: "2", // E-commerce Landing Page
    status: "Pending",
    appliedAt: "4 hours ago",
    proposal: "I specialize in high-converting landing pages. My portfolio includes 3 D2C brand landing pages that achieved 90+ Lighthouse scores. I can deliver this quickly.",
    proposedBudget: "₹5,500",
    estimatedCompletion: "1 week",
  },
  {
    id: "app_3",
    projectId: "3", // Python Automation Tool (Closed)
    status: "Rejected",
    appliedAt: "1 week ago",
    proposal: "I can write a clean Python script using gspread and the Notion API to automate this workflow reliably. I will also include detailed error logging.",
    proposedBudget: "₹4,000",
    estimatedCompletion: "1 week",
  },
  {
    id: "app_4",
    projectId: "5", // AI Chatbot Integration
    status: "Accepted",
    appliedAt: "3 days ago",
    proposal: "I have integrated OpenAI's GPT-4 API into customer service workflows previously. I am proficient in FastAPI and can implement streaming responses efficiently.",
    proposedBudget: "₹18,000",
    estimatedCompletion: "3 weeks",
  },
  {
    id: "app_5",
    projectId: "7", // SQL Data Dashboard
    status: "Shortlisted",
    appliedAt: "1 day ago",
    proposal: "I have strong SQL fundamentals and React experience. I can build the backend queries and the frontend dashboard to visualize the operations metrics.",
    proposedBudget: "₹8,000",
    estimatedCompletion: "2 weeks",
  },
  {
    id: "app_6",
    projectId: "9", // Blog Content Writing
    status: "Pending",
    appliedAt: "12 hours ago",
    proposal: "I run my own technical blog focusing on React and TypeScript. I can deliver well-researched, SEO-friendly articles that resonate with developers.",
    proposedBudget: "₹7,000",
    estimatedCompletion: "3 weeks",
  },
  {
    id: "app_7",
    projectId: "11", // Figma Design System
    status: "Pending",
    appliedAt: "5 days ago",
    proposal: "I've created design systems for 2 B2B platforms. I use variables, auto-layout, and robust component variants to ensure the system is highly scalable.",
    proposedBudget: "₹15,000",
    estimatedCompletion: "4 weeks",
  },
  {
    id: "app_8",
    projectId: "12", // JavaScript Web Scraper
    status: "Accepted",
    appliedAt: "1 week ago",
    proposal: "I can build a robust Puppeteer script in Node.js to scrape the pricing data reliably, bypassing common anti-bot measures and outputting clean JSON.",
    proposedBudget: "₹4,000",
    estimatedCompletion: "Less than 1 week",
  },
];

export function getApplicationWithProject(applicationId: string) {
  const app = allApplications.find((a) => a.id === applicationId);
  if (!app) return null;
  const project = allProjects.find((p) => p.id === app.projectId);
  if (!project) return null;
  return { ...app, project };
}

export function getAllApplicationsWithProjects() {
  return allApplications.map((app) => {
    const project = allProjects.find((p) => p.id === app.projectId);
    return { ...app, project };
  }).filter((app) => app.project !== undefined) as (Application & { project: typeof allProjects[0] })[];
}
