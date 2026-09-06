// Shared TypeScript types, interfaces, and domain models will be exported from here.
export type SiteConfig = {
  name: string;
  description: string;
  url?: string;
};

// ─── Project Types ────────────────────────────────────────────────────────────

export type ProjectCategory =
  | "Web Development"
  | "Mobile Development"
  | "UI/UX Design"
  | "Data Science"
  | "AI/ML"
  | "Content"
  | "Automation";

export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";

export type BudgetRange =
  | "Under ₹5,000"
  | "₹5,000–₹10,000"
  | "₹10,000–₹25,000"
  | "₹25,000+";

export type DurationRange =
  | "Less than 1 week"
  | "1–2 weeks"
  | "2–4 weeks"
  | "1+ month";

export type SortOption =
  | "Recommended"
  | "Newest"
  | "Budget: High to Low"
  | "Budget: Low to High"
  | "Deadline";

export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  deliverables?: string[];
  category: ProjectCategory;
  budgetValue: number; // raw number for sorting/filtering
  budget: string;       // formatted display string e.g. "₹9,000"
  duration: string;
  durationWeeks: number; // for filtering
  skills: string[];
  matchPercentage: number;
  client: string;
  clientDetails?: {
    type: string;
    location: string;
    projectsPosted: number;
    studentsHired: number;
    rating: number;
  };
  postedAt: string;
  experienceLevel: ExperienceLevel;
  deadline?: string;
  status?: "Open" | "In Progress" | "Completed" | "Closed";
}

export interface ProjectFilters {
  category: ProjectCategory | null;
  skills: string[];
  budgetRange: BudgetRange | null;
  duration: DurationRange | null;
  experienceLevel: ExperienceLevel | null;
}

// ─── Application Types ────────────────────────────────────────────────────────

export type ApplicationStatus = "Pending" | "Shortlisted" | "Accepted" | "Rejected";

export interface Application {
  id: string;
  projectId: string; // Links to Project.id
  status: ApplicationStatus;
  appliedAt: string;
  proposal: string;
  proposedBudget: string;
  estimatedCompletion: string;
}

// ─── Work Types ──────────────────────────────────────────────────────────────

export type WorkStatus = "In Progress" | "Awaiting Review" | "Completed";

export interface Milestone {
  id: string;
  title: string;
  status: "Not Started" | "In Progress" | "Completed";
}

export interface Deliverable {
  id: string;
  title: string;
  status: "Pending" | "Completed";
}

export interface Activity {
  id: string;
  type: "upload" | "note" | "milestone";
  content: string;
  timestamp: string;
}

export interface WorkProject {
  id: string;
  projectId: string; // Links to Project.id
  status: WorkStatus;
  progress: number;
  lastActivity: string;
  milestones: Milestone[];
  deliverables: Deliverable[];
  clientNotes?: string;
  recentActivity: Activity[];
  
  // Completed project fields
  completedAt?: string;
  rating?: number;
  review?: string;
  earnings?: string;
}

// ─── Profile Types ───────────────────────────────────────────────────────────

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  duration: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  projectType: string;
  completionDate?: string;
  githubUrl?: string;
  demoUrl?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  headline: string;
  about: string;
  location: string;
  availability: string;
  completionPercentage: number;
  isPublic: boolean;
  
  stats: {
    projectsCompleted: number;
    projectsInProgress: number;
    clientRating: number;
    profileViews: number;
  };
  
  primarySkills: string[];
  additionalSkills: string[];
  
  skillProfile: {
    category: string;
    score: number;
  }[];
  
  experience: Experience[];
  education: Education[];
  portfolio: PortfolioProject[];
}
