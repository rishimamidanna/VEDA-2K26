import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { refundEscrow } from "@/lib/server/payments/service";
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

    const body = await req.json().catch(() => ({}));

    // Find escrow for this payment
    const escrow = await prisma.escrow.findUnique({
      where: { paymentId: id },
    });

    if (!escrow) {
      return apiError("No escrow record found for this payment", 404, "NOT_FOUND");
    }

    const result = await refundEscrow(escrow.id, auth, body.reason);

    if ("error" in result) {
      if (result.error === "FORBIDDEN") {
        return apiError(result.message, 403, "FORBIDDEN");
      }
      if (result.error === "NOT_FOUND") {
        return apiError(result.message, 404, "NOT_FOUND");
      }
      if (result.error === "CANNOT_REFUND") {
        return apiError(result.message, 400, "CANNOT_REFUND");
      }
      if (result.error === "ALREADY_REFUNDED") {
        return apiError(result.message, 409, "ALREADY_REFUNDED");
      }
      if (result.error === "INVALID_STATE") {
        return apiError(result.message, 400, "INVALID_STATE");
      }
      return apiError((result as any).message || "Bad request", 400, "BAD_REQUEST");
    }

    return apiSuccess({ payment: result.payment, escrow: result.escrow });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("POST /api/payments/[id]/refund error:", error);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
