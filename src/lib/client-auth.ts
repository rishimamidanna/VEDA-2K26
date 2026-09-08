export interface ClientUser {
  id: string;
  name: string;
  email: string;
  company?: string;
  role: "client";
  initials: string;
  createdAt: string;
}

/**
 * DEPRECATED PROTOTYPE STORAGE HELPERS
 * Note: SkillBridge uses server-backed HttpOnly JWT cookies (`sb_session`) as the
 * authoritative source of truth. These functions are retained only for backward
 * compatibility and are not used by the production authentication flow.
 */
export const CLIENT_AUTH_STORAGE_KEY = "skillbridge_client_auth_session";
export const CLIENT_AUTH_COOKIE_NAME = "sb_client_session";

export function getStoredClientSession(): ClientUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(CLIENT_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as ClientUser;
    if (user && user.role === "client") {
      return user;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveClientSession(user: ClientUser) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CLIENT_AUTH_STORAGE_KEY, JSON.stringify(user));
    // Set secure cookie so middleware / route protection can check authentication
    document.cookie = `${CLIENT_AUTH_COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify({ id: user.id, role: user.role, email: user.email })
    )}; path=/; max-age=604800; SameSite=Lax`;
    window.dispatchEvent(new Event("skillbridge_client_auth_updated"));
  } catch {
    // Ignore write issues in private mode
  }
}

export function clearClientSession() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CLIENT_AUTH_STORAGE_KEY);
    document.cookie = `${CLIENT_AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    window.dispatchEvent(new Event("skillbridge_client_auth_updated"));
  } catch {
    // Ignore clear issues
  }
}
