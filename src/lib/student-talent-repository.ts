import {
  StudentProfile,
  DEMO_STUDENT_TALENT,
} from "@/data/student-talent";

export type { StudentProfile };

export interface StudentFilterQuery {
  searchQuery?: string;
  expertise?: string;
  experience?: string;
  availability?: string;
  skill?: string;
}

const STORAGE_KEY = "skillbridge_student_talent_profiles";

/**
 * Clean student talent repository decoupling UI views from student data sources.
 * Allows effortless transition to an API or database layer while maintaining
 * consistent data fetching and filtering across the client portal.
 */
export const studentTalentRepository = {
  /**
   * Retrieves all available student talent profiles.
   * Checks for persistent storage updates if available; defaults to seeded profiles.
   */
  getAllStudents(): StudentProfile[] {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Fall back to DEMO_STUDENT_TALENT
      }
    }
    return DEMO_STUDENT_TALENT;
  },

  /**
   * Retrieves a single student profile by unique ID.
   * Handles invalid IDs safely by returning null.
   */
  getStudentById(id: string): StudentProfile | null {
    if (!id || typeof id !== "string") return null;
    const students = this.getAllStudents();
    return students.find((s) => s.id === id) || null;
  },

  /**
   * Filter and search student talent profiles by query, category, experience, availability, and skill.
   */
  filterStudents(query: StudentFilterQuery): StudentProfile[] {
    const students = this.getAllStudents();

    return students.filter((student) => {
      // 1. Search query across name, headline, skills, college
      if (query.searchQuery && query.searchQuery.trim()) {
        const q = query.searchQuery.toLowerCase().trim();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesHeadline = student.headline.toLowerCase().includes(q);
        const matchesCollege = student.college.toLowerCase().includes(q);
        const matchesSkills = student.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesHeadline && !matchesCollege && !matchesSkills) {
          return false;
        }
      }

      // 2. Category / Expertise filter
      if (
        query.expertise &&
        query.expertise !== "All Categories" &&
        student.expertise !== query.expertise
      ) {
        return false;
      }

      // 3. Experience filter
      if (
        query.experience &&
        query.experience !== "All Levels" &&
        student.experience !== query.experience
      ) {
        return false;
      }

      // 4. Availability filter
      if (
        query.availability &&
        query.availability !== "All Availabilities" &&
        student.availability !== query.availability
      ) {
        return false;
      }

      // 5. Skill filter
      if (query.skill && !student.skills.includes(query.skill)) {
        return false;
      }

      return true;
    });
  },
};
