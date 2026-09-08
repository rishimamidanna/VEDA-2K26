import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { releaseEscrow } from "@/lib/server/payments/service";
import { checkCsrf } from "@/lib/server/security/csrf";
import { rateLimiter, RATE_LIMITS } from "@/lib/server/security/rate-limit";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteProps) {
  try {
    // 1. CSRF Defense
    const csrfResult = checkCsrf(req);
    if (!csrfResult.valid) {
      return apiError(csrfResult.message || "Cross-origin request blocked", 403, "CSRF_BLOCKED");
    }

    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);

    // 2. Rate Limiting
    const rateLimit = rateLimiter.check(`pay:${auth.user.id}`, RATE_LIMITS.PAYMENTS);
    if (!rateLimit.success) {
      const errRes = apiError("Too many payment actions. Please try again later.", 429, "RATE_LIMIT_EXCEEDED");
      errRes.headers.set("Retry-After", String(rateLimit.resetTime));
      return errRes;
    }

    const result = await releaseEscrow(id, auth);

    if ("error" in result) {
      if (result.error === "FORBIDDEN") {
        return apiError(result.message, 403, "FORBIDDEN");
      }
      if (result.error === "NOT_FOUND") {
        return apiError(result.message, 404, "NOT_FOUND");
      }
      if (result.error === "ALREADY_RELEASED") {
        return apiError(result.message, 409, "ALREADY_RELEASED");
      }
      if (result.error === "INVALID_STATE") {
        return apiError(result.message, 400, "INVALID_STATE");
      }
      return apiError((result as any).message || "Bad request", 400, "BAD_REQUEST");
    }

    return apiSuccess({ escrow: result.escrow, wallet: result.wallet });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("POST /api/escrows/[id]/release error:", error);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
