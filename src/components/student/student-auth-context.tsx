"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export interface StudentAuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "student";
  studentProfile?: {
    id: string;
    headline?: string;
    college?: string;
    bio?: string;
    avatarUrl?: string;
    isAvailable?: boolean;
    hourlyRate?: number;
  };
}

interface StudentAuthContextType {
  user: StudentAuthUser | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    password?: string,
    headline?: string,
    college?: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(
  undefined
);

function formatStudentUser(serverUser: any): StudentAuthUser {
  return {
    id: serverUser.id,
    name: serverUser.name || "Student Builder",
    email: serverUser.email,
    avatar:
      serverUser.avatar ||
      (serverUser.name || "AJ")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    role: "student",
    studentProfile: serverUser.studentProfile || undefined,
  };
}

export function StudentAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<StudentAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Authoritative identity resolution from server session
  const refreshSession = useCallback(async () => {
    try {
      const data = await apiClient.get<{ user: any }>("/api/auth/me");
      if (data?.user && data.user.role === "STUDENT") {
        setUser(formatStudentUser(data.user));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password?: string): Promise<boolean> => {
      const cleanEmail = email.trim().toLowerCase();
      const effectivePassword = password || "";

      const data = await apiClient.post<{ user: any }>("/api/auth/login", {
        email: cleanEmail,
        password: effectivePassword,
      });

      if (data?.user) {
        setUser(formatStudentUser(data.user));
        return true;
      }
      return false;
    },
    []
  );

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password?: string,
      headline?: string,
      college?: string
    ): Promise<boolean> => {
      const cleanEmail = email.trim().toLowerCase();
      const effectivePassword = password || "Student123!";

      const data = await apiClient.post<{ user: any }>("/api/auth/signup", {
        name: name.trim(),
        email: cleanEmail,
        password: effectivePassword,
        role: "STUDENT",
        headline: headline?.trim(),
        college: college?.trim(),
      });

      if (data?.user) {
        setUser(formatStudentUser(data.user));
        return true;
      }
      return false;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
      // Ignore network errors on logout
    }
    setUser(null);
    router.push("/student/login");
  }, [router]);

  return (
    <StudentAuthContext.Provider
      value={{ user, isLoading, login, signup, logout, refreshSession }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error("useStudentAuth must be used within a StudentAuthProvider");
  }
  return context;
}
