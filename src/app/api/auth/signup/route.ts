import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
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
    const rateLimit = rateLimiter.check(`auth:signup:${ip}`, RATE_LIMITS.AUTH);
    if (!rateLimit.success) {
      const errRes = apiError("Too many signup attempts. Please try again later.", 429, "RATE_LIMIT_EXCEEDED");
      errRes.headers.set("Retry-After", String(rateLimit.resetTime));
      return errRes;
    }

    const body = await req.json().catch(() => ({}));
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const name = body.name?.trim();
    const rawRole = body.role?.trim().toUpperCase();

    // Validation
    if (!email || !email.includes("@")) {
      return apiError("Valid email address is required", 400, "INVALID_EMAIL");
    }
    if (!password || password.length < 6) {
      return apiError("Password must be at least 6 characters long", 400, "INVALID_PASSWORD");
    }
    if (!name) {
      return apiError("Name is required", 400, "MISSING_NAME");
    }
    if (rawRole !== "STUDENT" && rawRole !== "CLIENT") {
      return apiError("Role must be either STUDENT or CLIENT", 400, "INVALID_ROLE");
    }

    const role: UserRole = rawRole === "CLIENT" ? UserRole.CLIENT : UserRole.STUDENT;

    // Client-specific validation
    if (role === UserRole.CLIENT && !body.companyName?.trim()) {
      return apiError("Company name is required for Client accounts", 400, "MISSING_COMPANY");
    }

    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return apiError("An account with this email address already exists", 409, "EMAIL_EXISTS");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const initials = name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SB";

    // Transactionally create User and corresponding Profile
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          avatar: initials,
          role,
        },
      });

      if (role === UserRole.STUDENT) {
        const studentProfile = await tx.studentProfile.create({
          data: {
            userId: user.id,
            headline: body.headline?.trim() || "Student Freelancer",
            college: body.college?.trim() || null,
            location: body.location?.trim() || null,
            expertise: body.expertise?.trim() || "Web Development",
            experienceLevel: body.experienceLevel?.trim() || "Beginner",
            availability: body.availability?.trim() || "Available Now",
            hourlyRate: body.hourlyRate?.trim() || null,
          },
        });
        return { ...user, studentProfile, clientProfile: null };
      } else {
        const clientProfile = await tx.clientProfile.create({
          data: {
            userId: user.id,
            companyName: body.companyName.trim(),
            industry: body.industry?.trim() || null,
            description: body.description?.trim() || null,
            location: body.location?.trim() || null,
          },
        });
        return { ...user, studentProfile: null, clientProfile };
      }
    });

    // Create session token
    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      studentProfileId: newUser.studentProfile?.id || null,
      clientProfileId: newUser.clientProfile?.id || null,
    });

    const sanitizedUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar,
      studentProfile: newUser.studentProfile,
      clientProfile: newUser.clientProfile,
    };

    const response = apiSuccess(
      {
        user: sanitizedUser,
        token,
      },
      201
    );

    setSessionCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("POST /api/auth/signup error:", error);
    return apiError("Failed to create account", 500, "INTERNAL_ERROR");
  }
}
