// Shared TypeScript types, interfaces, and domain models will be exported from here.
export type SiteConfig = {
  name: string;
  description: string;
  url?: string;
};

// ─── Shared Base Types ────────────────────────────────────────────────────────

export type Role = "student" | "client";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar?: string;
  avatarInitials?: string;
  createdAt: string;
}

export interface ClientProfile {
  id: string;
  userId: string;
  companyName: string;
  industry?: string;
  location?: string;
  description?: string;
  logoUrl?: string;
}

export type SkillProficiency = "Beginner" | "Intermediate" | "Advanced";

export interface Skill {
  id: string;
  name: string;
}

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
export type ProjectStatus = "Draft" | "Open" | "In Progress" | "Completed" | "Closed";

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

// Canonical Project Model
export interface Project {
  id: string;
  clientId: string; // Links to ClientProfile / User
  title: string;
  description: string;
  fullDescription?: string;
  deliverables?: string[];
  category: ProjectCategory | string;
  
  // Budget and Timeline
  budgetValue?: number; // raw number for sorting/filtering
  budget: string;       // formatted display string e.g. "₹9,000"
  duration: string;
  durationWeeks?: number; // for filtering
  deadline?: string;
  
  // Requirements
  skills: string[]; // List of skill names or IDs
  experienceLevel: ExperienceLevel | string;
  
  // Status and Meta
  status: ProjectStatus;
  postedAt: string;
  createdAt?: string;
  updatedAt?: string;
  
  // --- Client-facing derived fields ---
  applicantsCount?: number;
  timelineNote?: string;
  isUserCreated?: boolean;

  // --- Student-facing derived fields (for UI matching/display) ---
  matchPercentage?: number;
  client?: string; // Company Name
  clientDetails?: {
    type?: string;
    location?: string;
    projectsPosted?: number;
    studentsHired?: number;
    rating?: number;
  };
}

export interface ProjectFilters {
  category: ProjectCategory | null;
  skills: string[];
  budgetRange: BudgetRange | null;
  duration: DurationRange | null;
  experienceLevel: ExperienceLevel | null;
}

// ─── Application Types ────────────────────────────────────────────────────────

// Canonical Application Status
export type ApplicationStatus = "Pending" | "Under Review" | "Shortlisted" | "Accepted" | "Rejected" | "Withdrawn";

// Canonical Application Model
export interface Application {
  id: string;
  projectId: string; // Links to Project.id
  studentId?: string; // Links to StudentProfile / User
  
  status: ApplicationStatus;
  
  // Student's application details
  proposal: string;
  proposedBudget?: string;
  estimatedCompletion?: string;
  
  // Timestamps
  appliedAt: string;
  updatedAt?: string;
  
  // --- Client-facing derived fields (for UI) ---
  name?: string;
  avatarInitials?: string;
  headline?: string;
  college?: string;
  relevantSkills?: string[];
  portfolioSummary?: string;
  portfolioUrl?: string;
  demoMatchScore?: string;
}

// ─── Work / Contract Types ───────────────────────────────────────────────────

export type WorkStatus = "In Progress" | "Awaiting Review" | "Completed";

export interface Milestone {
  id: string;
  workProjectId?: string;
  title: string;
  status: "Not Started" | "In Progress" | "Completed";
  dueDate?: string;
}

export interface Deliverable {
  id: string;
  workProjectId?: string;
  title: string;
  status: "Pending" | "Completed";
  submittedAt?: string;
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
  studentId?: string;
  clientId?: string;
  
  status: WorkStatus;
  currentPhase?: string;
  progress: number; // percentage
  
  startDate?: string;
  dueDate?: string;
  
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
  studentId?: string;
  title: string;
  description: string;
  technologies: string[];
  projectType?: string;
  category?: string;
  completionDate?: string;
  githubUrl?: string;
  liveUrl?: string;
  demoUrl?: string;
  tags?: string[];
}

export interface StudentProfile {
  id: string;
  userId?: string;
  
  // Basic info
  name: string;
  avatarInitials?: string;
  headline: string;
  about: string; // or bio
  bio?: string;
  location: string;
  college?: string;
  graduationYear?: string;
  
  // Settings
  availability: string; // "Available Now" | "10-20 hrs/week" etc
  hourlyRate?: string;
  completionPercentage: number;
  isPublic: boolean;
  joinedDate?: string;
  
  // Skills & Expertise
  expertise?: string;
  primarySkills: string[];
  additionalSkills: string[];
  skillProfile: {
    category: string;
    score: number;
  }[];
  
  // Experience & Education
  experience: Experience[];
  education: Education[];
  
  // Portfolio
  portfolioSummary?: string;
  portfolio: PortfolioProject[];
  portfolioProjects?: {
    title: string;
    description: string;
    tags: string[];
  }[];
  
  // Stats
  stats: {
    projectsCompleted: number;
    projectsInProgress: number;
    clientRating: number;
    profileViews: number;
  };
}

// ─── Review Types ─────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ─── Messaging Types ──────────────────────────────────────────────────────────

export type MessageSender = "student" | "client";
export type MessageStatus = "sending" | "sent" | "read";
export type ConversationStatus = "online" | "offline" | "away";

export interface MessageAttachment {
  id: string;
  name: string;
  size?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId?: string; // Links to User.id
  sender: MessageSender;
  content: string;
  timestamp: string;
  status: MessageStatus;
  attachment?: MessageAttachment;
}

export interface Conversation {
  id: string;
  projectId: string;
  studentId?: string;
  clientId?: string;
  
  // UI Display fields (derived)
  client: string;
  clientInitial: string;
  projectTitle: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  clientStatus: ConversationStatus;
  clientStatusText?: string;
}
