import type { WorkProject } from "@/types";
import { allProjects } from "./projects";

export const allWorkProjects: WorkProject[] = [
  {
    id: "work_1",
    projectId: "5", // AI Chatbot Integration
    status: "In Progress",
    progress: 68,
    lastActivity: "Client reviewed your latest update 3 hours ago",
    milestones: [
      { id: "m1", title: "Requirements & Planning", status: "Completed" },
      { id: "m2", title: "Conversation Flow", status: "Completed" },
      { id: "m3", title: "API Integration", status: "Completed" },
      { id: "m4", title: "Testing & Optimization", status: "In Progress" },
      { id: "m5", title: "Final Delivery", status: "Not Started" },
    ],
    deliverables: [
      { id: "d1", title: "Project architecture", status: "Completed" },
      { id: "d2", title: "API integration", status: "Completed" },
      { id: "d3", title: "Final chatbot implementation", status: "Pending" },
      { id: "d4", title: "Documentation", status: "Pending" },
    ],
    clientNotes: "Please make sure the chatbot handles fallback responses gracefully and include setup instructions in the final submission.",
    recentActivity: [
      { id: "a1", type: "note", content: "Client added a note: 'Looks good. Please continue with API testing.'", timestamp: "3 hours ago" },
      { id: "a2", type: "upload", content: "You uploaded: chatbot-v2.zip", timestamp: "3 hours ago" },
      { id: "a3", type: "milestone", content: "Milestone completed: API Integration", timestamp: "1 day ago" },
    ],
  },
  {
    id: "work_2",
    projectId: "2", // E-commerce Landing Page
    status: "In Progress",
    progress: 42,
    lastActivity: "New project milestone added yesterday",
    milestones: [
      { id: "m1", title: "Design System & Variables", status: "Completed" },
      { id: "m2", title: "Hero & Product Sections", status: "In Progress" },
      { id: "m3", title: "Scroll Animations", status: "Not Started" },
      { id: "m4", title: "Mobile Optimization", status: "Not Started" },
    ],
    deliverables: [
      { id: "d1", title: "Figma design system", status: "Completed" },
      { id: "d2", title: "React components", status: "Pending" },
      { id: "d3", title: "Final optimized build", status: "Pending" },
    ],
    recentActivity: [
      { id: "a1", type: "milestone", content: "New project milestone added yesterday", timestamp: "1 day ago" },
      { id: "a2", type: "upload", content: "You uploaded: initial-components.zip", timestamp: "2 days ago" },
    ],
  },
  {
    id: "work_3",
    projectId: "7", // SQL Data Dashboard (Awaiting Review)
    status: "Awaiting Review",
    progress: 100,
    lastActivity: "You submitted your work 2 hours ago",
    milestones: [
      { id: "m1", title: "Database Schema", status: "Completed" },
      { id: "m2", title: "SQL Queries", status: "Completed" },
      { id: "m3", title: "Dashboard UI", status: "Completed" },
      { id: "m4", title: "Integration & Testing", status: "Completed" },
    ],
    deliverables: [
      { id: "d1", title: "SQL Schema & Queries", status: "Completed" },
      { id: "d2", title: "React Dashboard code", status: "Completed" },
      { id: "d3", title: "Deployment instructions", status: "Completed" },
    ],
    recentActivity: [
      { id: "a1", type: "upload", content: "You uploaded: final-dashboard-build.zip", timestamp: "2 hours ago" },
      { id: "a2", type: "note", content: "You added a note: 'All features implemented as requested. Please let me know if you need any adjustments.'", timestamp: "2 hours ago" },
    ],
  },
  {
    id: "work_4",
    projectId: "3", // Python Automation Tool (Completed)
    status: "Completed",
    progress: 100,
    lastActivity: "Project completed on August 28, 2026",
    completedAt: "August 28, 2026",
    rating: 5.0,
    review: "Excellent work. Delivered ahead of schedule and communicated clearly. The script works flawlessly and saves us hours of manual work each week.",
    earnings: "₹4,500",
    milestones: [
      { id: "m1", title: "Requirements Gathering", status: "Completed" },
      { id: "m2", title: "API Integration", status: "Completed" },
      { id: "m3", title: "Testing & Handover", status: "Completed" },
    ],
    deliverables: [
      { id: "d1", title: "Python automation script", status: "Completed" },
      { id: "d2", title: "Documentation", status: "Completed" },
    ],
    recentActivity: [
      { id: "a1", type: "note", content: "Client reviewed and approved final submission", timestamp: "Aug 28, 2026" },
      { id: "a2", type: "note", content: "Client left a 5-star review", timestamp: "Aug 28, 2026" },
    ],
  },
  {
    id: "work_5",
    projectId: "12", // JavaScript Web Scraper (Completed)
    status: "Completed",
    progress: 100,
    lastActivity: "Project completed on August 15, 2026",
    completedAt: "August 15, 2026",
    rating: 4.8,
    review: "Solid work on the scraper. Code was clean and well documented.",
    earnings: "₹4,000",
    milestones: [],
    deliverables: [],
    recentActivity: [],
  },
];

export function getWorkProject(workId: string) {
  const work = allWorkProjects.find((w) => w.id === workId);
  if (!work) return null;
  const project = allProjects.find((p) => p.id === work.projectId);
  if (!project) return null;
  return { ...work, project };
}

export function getAllWorkProjects() {
  return allWorkProjects.map((work) => {
    const project = allProjects.find((p) => p.id === work.projectId);
    return { ...work, project };
  }).filter((work) => work.project !== undefined) as (WorkProject & { project: typeof allProjects[0] })[];
}
