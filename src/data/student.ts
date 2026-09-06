// Mock data for the Student Dashboard

export const studentProfile = {
  name: "Alex Johnson",
  major: "Computer Science",
  avatar: "AJ",
  profileStrength: 86,
};

export const studentStats = [
  { label: "Applications", value: "12", icon: "FileText" },
  { label: "Active Projects", value: "2", icon: "Briefcase" },
  { label: "Completed", value: "8", icon: "CheckCircle" },
  { label: "Profile Strength", value: "86%", icon: "TrendingUp" },
];

export const recommendedProjects = [
  {
    id: "1",
    title: "React Developer",
    budget: "₹9,000",
    duration: "2 weeks",
    match: 96,
    skills: ["React", "TypeScript", "Next.js"],
    category: "Frontend",
  },
  {
    id: "2",
    title: "E-commerce Landing Page",
    budget: "₹6,000",
    duration: "2 weeks",
    match: 91,
    skills: ["React", "Tailwind", "Figma"],
    category: "Frontend",
  },
  {
    id: "3",
    title: "Python Automation Tool",
    budget: "₹4,500",
    duration: "1 week",
    match: 88,
    skills: ["Python", "APIs", "Automation"],
    category: "Backend",
  },
];

export const recentApplications = [
  {
    id: "1",
    title: "E-commerce Landing Page",
    appliedAgo: "2 days ago",
    status: "Shortlisted" as const,
  },
  {
    id: "2",
    title: "Data Analytics Dashboard",
    appliedAgo: "4 days ago",
    status: "Pending" as const,
  },
  {
    id: "3",
    title: "AI Chatbot Development",
    appliedAgo: "1 week ago",
    status: "Accepted" as const,
  },
];

export const activeProject = {
  id: "1",
  title: "AI Chatbot Development",
  progress: 68,
  deadline: "Sep 18, 2026",
};

export const navItems = [
  { label: "Dashboard", href: "/student", icon: "LayoutDashboard" },
  { label: "Find Projects", href: "/student/projects", icon: "Search" },
  { label: "Applications", href: "/student/applications", icon: "FileText" },
  { label: "My Work", href: "/student/work", icon: "Briefcase" },
  { label: "Messages", href: "/student/messages", icon: "MessageSquare" },
  { label: "Profile", href: "/student/profile", icon: "User" },
];
