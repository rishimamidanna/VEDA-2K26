import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken, setSessionCookie } from "@/lib/server/auth/session";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { checkCsrf } from "@/lib/server/security/csrf";
import { getClientIp, rateLimiter, RATE_LIMITS } from "@/lib/server/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. CSRF Defense
    const csrfResult = checkCsrf(req);
    if (!csrfResult.valid) {
      return apiError(csrfResult.message || "Cross-origin request blocked", 403, "CSRF_BLOCKED");
    }

    // 2. Rate Limiting (5 attempts / min / IP)
    const ip = getClientIp(req);
    const rateLimit = rateLimiter.check(`auth:login:${ip}`, RATE_LIMITS.AUTH);
    if (!rateLimit.success) {
      const errRes = apiError("Too many login attempts. Please try again later.", 429, "RATE_LIMIT_EXCEEDED");
      errRes.headers.set("Retry-After", String(rateLimit.resetTime));
      return errRes;
    }

    const body = await req.json().catch(() => ({}));
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return apiError("Email and password are required", 400, "MISSING_CREDENTIALS");
    }

    // 1. Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        clientProfile: true,
      },
    });

    if (!user || !user.passwordHash) {
      return apiError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    // 2. Verify password securely server-side
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return apiError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    // 3. Create server-signed session token
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      studentProfileId: user.studentProfile?.id || null,
      clientProfileId: user.clientProfile?.id || null,
    });

    // 4. Return sanitized user data and attach HttpOnly cookie
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      studentProfile: user.studentProfile,
      clientProfile: user.clientProfile,
    };

    const response = apiSuccess({
      user: sanitizedUser,
      token, // Also returned for mobile or API clients
    });

    setSessionCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("POST /api/auth/login error:", error);
    return apiError("Failed to authenticate", 500, "INTERNAL_ERROR");
  }
}
