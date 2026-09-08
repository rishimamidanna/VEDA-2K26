import { prisma } from "@/lib/prisma";
import { User, StudentProfile, ClientProfile, UserRole } from "@prisma/client";
import { extractSessionTokenFromRequest, verifySessionToken, SESSION_COOKIE_NAME } from "./session";
import { cookies } from "next/headers";

export class AuthError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number = 401, code: string = "UNAUTHORIZED") {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.code = code;
  }
}

export interface AuthenticatedUser {
  user: User;
  role: UserRole;
  studentProfile: StudentProfile | null;
  clientProfile: ClientProfile | null;
}

export interface AuthenticatedStudent extends AuthenticatedUser {
  role: "STUDENT";
  studentProfile: StudentProfile;
}

export interface AuthenticatedClient extends AuthenticatedUser {
  role: "CLIENT";
  clientProfile: ClientProfile;
}

/**
 * Server-side authentication resolution.
 * Resolves the authenticated user from cryptographically verified server-managed session tokens.
 *
 * Security:
 * - Never trusts browser-supplied x-user-id, x-user-role, or studentId/clientId in body.
 * - Resolves identity and role strictly from the database via verified JWT session.
 */
export async function getCurrentUser(req: Request): Promise<AuthenticatedUser | null> {
  // 1. Primary Authentication: Verified cryptographic session token (Cookie or Bearer header)
  const token = extractSessionTokenFromRequest(req);

  if (token) {
    const payload = await verifySessionToken(token);
    if (payload && payload.userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          include: {
            studentProfile: true,
            clientProfile: true,
          },
        });

        if (user) {
          return {
            user,
            role: user.role,
            studentProfile: user.studentProfile,
            clientProfile: user.clientProfile,
          };
        }
      } catch (error) {
        console.error("Database error resolving session user:", error);
      }
    }
  }

  // 2. Security Defense: Legacy authentication headers (x-user-id, x-user-role, x-user-email)
  // are categorically rejected and never trusted under any circumstances.
  
  // 3. Automated Test Runner Isolation:
  // Strictly disabled in production. Gated exclusively to NODE_ENV === "test" with internal secret.
  if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV === "test") {
    const testSecretHeader = req.headers.get("x-skillbridge-test-auth");
    const authSecret = process.env.AUTH_SECRET;

    if (authSecret && testSecretHeader === authSecret) {
      const testEmail = req.headers.get("x-test-user-email");
      const testId = req.headers.get("x-test-user-id");

      if (testEmail || testId) {
        const user = await prisma.user.findFirst({
          where: testEmail
            ? { email: testEmail }
            : {
                OR: [
                  { id: testId! },
                  { studentProfile: { id: testId! } },
                  { clientProfile: { id: testId! } },
                ],
              },
          include: {
            studentProfile: true,
            clientProfile: true,
          },
        });

        if (user) {
          return {
            user,
            role: user.role,
            studentProfile: user.studentProfile,
            clientProfile: user.clientProfile,
          };
        }
      }
    }
  }

  return null;
}

export async function requireAuthenticatedUser(req: Request): Promise<AuthenticatedUser> {
  const auth = await getCurrentUser(req);
  if (!auth) {
    throw new AuthError("Authentication required to access this resource", 401, "UNAUTHORIZED");
  }
  return auth;
}

export async function requireRole(req: Request, requiredRole: UserRole): Promise<AuthenticatedUser> {
  const auth = await requireAuthenticatedUser(req);
  if (auth.role !== requiredRole) {
    throw new AuthError(`Access denied: Requires ${requiredRole} role`, 403, "FORBIDDEN");
  }
  return auth;
}

export async function requireStudent(req: Request): Promise<AuthenticatedStudent> {
  const auth = await requireRole(req, UserRole.STUDENT);
  if (!auth.studentProfile) {
    throw new AuthError("Student profile not found for user", 403, "PROFILE_NOT_FOUND");
  }
  return auth as AuthenticatedStudent;
}

export async function requireClient(req: Request): Promise<AuthenticatedClient> {
  const auth = await requireRole(req, UserRole.CLIENT);
  if (!auth.clientProfile) {
    throw new AuthError("Client profile not found for user", 403, "PROFILE_NOT_FOUND");
  }
  return auth as AuthenticatedClient;
}

export async function getServerSession(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload || !payload.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        studentProfile: true,
        clientProfile: true,
      },
    });

    if (!user) return null;

    return {
      user,
      role: user.role,
      studentProfile: user.studentProfile,
      clientProfile: user.clientProfile,
    };
  } catch {
    return null;
  }
}

