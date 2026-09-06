"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ClientUser,
  getStoredClientSession,
  saveClientSession,
  clearClientSession,
} from "@/lib/client-auth";

interface ClientAuthContextType {
  user: ClientUser | null;
  isLoading: boolean;
  login: (email: string, name?: string, company?: string) => Promise<boolean>;
  signup: (name: string, email: string, company?: string) => Promise<boolean>;
  logout: () => void;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(() => {
    return getStoredClientSession();
  });
  const isLoading = false;
  const router = useRouter();

  const login = useCallback(async (email: string, name?: string, company?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name?.trim() || cleanEmail.split("@")[0] || "Client Partner";
    const initials = displayName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CP";

    const clientUser: ClientUser = {
      id: `client_${Date.now()}`,
      name: displayName,
      email: cleanEmail,
      company: company?.trim() || "SkillBridge Partner",
      role: "client",
      initials,
      createdAt: new Date().toISOString(),
    };

    saveClientSession(clientUser);
    setUser(clientUser);
    return true;
  }, []);

  const signup = useCallback(async (name: string, email: string, company?: string): Promise<boolean> => {
    return login(email, name, company);
  }, [login]);

  const logout = useCallback(() => {
    clearClientSession();
    setUser(null);
    router.push("/client/login");
  }, [router]);

  return (
    <ClientAuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
