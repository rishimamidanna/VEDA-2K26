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
