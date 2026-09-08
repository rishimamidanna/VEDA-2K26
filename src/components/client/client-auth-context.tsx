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
import { ClientUser } from "@/lib/client-auth";

interface ClientAuthContextType {
  user: ClientUser | null;
  isLoading: boolean;
  login: (
    email: string,
    name?: string,
    company?: string,
    password?: string
  ) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    company?: string,
    password?: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(
  undefined
);

function formatClientUser(serverUser: any): ClientUser {
  return {
    id: serverUser.clientProfile?.id || serverUser.id,
    name: serverUser.name || "Client Partner",
    email: serverUser.email,
    company:
      serverUser.clientProfile?.companyName || "SkillBridge Partner",
    role: "client",
    initials:
      serverUser.avatar ||
      (serverUser.name || "CP")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    createdAt: serverUser.createdAt || new Date().toISOString(),
  };
}

export function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Authoritative identity resolution from server session
  const refreshSession = useCallback(async () => {
    try {
      const data = await apiClient.get<{ user: any }>("/api/auth/me");
      if (data?.user && data.user.role === "CLIENT") {
        setUser(formatClientUser(data.user));
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
    async (
      email: string,
      _name?: string,
      _company?: string,
      password?: string
    ): Promise<boolean> => {
      const cleanEmail = email.trim().toLowerCase();
      const effectivePassword = password || "";

      const data = await apiClient.post<{ user: any }>("/api/auth/login", {
        email: cleanEmail,
        password: effectivePassword,
      });

      if (data?.user) {
        setUser(formatClientUser(data.user));
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
      company?: string,
      password?: string
    ): Promise<boolean> => {
      const cleanEmail = email.trim().toLowerCase();
      const effectivePassword = password || "Client123!";

      const data = await apiClient.post<{ user: any }>("/api/auth/signup", {
        name: name.trim(),
        email: cleanEmail,
        companyName: company?.trim() || "SkillBridge Partner",
        password: effectivePassword,
        role: "CLIENT",
      });

      if (data?.user) {
        setUser(formatClientUser(data.user));
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
    router.push("/client/login");
  }, [router]);

  return (
    <ClientAuthContext.Provider
      value={{ user, isLoading, login, signup, logout, refreshSession }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error("useClientAuth must be used within a ClientAuthProvider");
  }
  return context;
}
