import type { StudentProfile } from "@/types";

export const initialProfileData: StudentProfile = {
  id: "student_1",
  name: "Alex Johnson",
  headline: "Frontend Developer & Computer Science Student",
  about: "I'm a Computer Science student interested in frontend development, data-driven applications, and automation. I enjoy working on real-world projects that help me strengthen my technical skills and build practical experience. I specialize in the React ecosystem and have a strong foundation in modern JavaScript.",
  location: "Bengaluru, India",
  availability: "Available for freelance projects",
  completionPercentage: 86,
  isPublic: true,
  
  stats: {
    projectsCompleted: 8,
    projectsInProgress: 2,
    clientRating: 4.8,
    profileViews: 124,
  },
  
  primarySkills: [
    "React",
    "TypeScript",
    "Next.js",
    "Python",
  ],
  
  additionalSkills: [
    "SQL",
    "Tailwind CSS",
    "Git",
    "Figma",
    "Data Visualization",
  ],
  
  skillProfile: [
    { category: "Frontend Development", score: 92 },
    { category: "Backend Development", score: 74 },
    { category: "Data & Analytics", score: 81 },
    { category: "UI/UX", score: 68 },
  ],
  
  experience: [
    {
      id: "exp_1",
      role: "Frontend Developer",
      company: "SkillBridge Projects",
      duration: "2026 – Present",
      description: "Worked on responsive web applications and real-world client projects.",
    },
    {
      id: "exp_2",
      role: "Open Source Contributor",
      company: "GitHub",
      duration: "2025 – Present",
      description: "Contributed to various open source React libraries and tooling.",
    }
  ],
  
  education: [
    {
      id: "edu_1",
      degree: "B.Tech – Computer Science",
      institution: "Aditya University",
      duration: "2024 – 2028",
    }
  ],
  
  portfolio: [
    {
      id: "port_1",
      title: "React Analytics Dashboard",
      description: "Responsive analytics dashboard with interactive charts and reusable React components.",
      technologies: ["React", "TypeScript", "Tailwind"],
      projectType: "SkillBridge Project",
      completionDate: "August 2026",
      githubUrl: "https://github.com",
      demoUrl: "https://demo.com",
    },
    {
      id: "port_2",
      title: "E-commerce Landing Page",
      description: "High-converting product landing page for a D2C skincare brand.",
      technologies: ["React", "Tailwind", "Figma"],
      projectType: "Client Project",
      completionDate: "July 2026",
      githubUrl: "https://github.com",
      demoUrl: "https://demo.com",
    },
    {
      id: "port_3",
      title: "Python Automation Tool",
      description: "Automated repetitive data-entry tasks integrating Google Sheets and Notion APIs.",
      technologies: ["Python", "APIs", "Automation"],
      projectType: "SkillBridge Project",
      completionDate: "June 2026",
      githubUrl: "https://github.com",
    },
    {
      id: "port_4",
      title: "AI Chatbot",
      description: "LLM-powered customer support chatbot with conversation history.",
      technologies: ["Python", "LLM", "FastAPI"],
      projectType: "Personal Project",
      completionDate: "May 2026",
      githubUrl: "https://github.com",
    }
  ],
};
