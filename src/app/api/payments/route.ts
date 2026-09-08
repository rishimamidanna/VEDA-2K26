import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import {
  createContractPayment,
  listPayments,
} from "@/lib/server/payments/service";
import { checkCsrf } from "@/lib/server/security/csrf";
import { rateLimiter, RATE_LIMITS } from "@/lib/server/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. CSRF Defense
    const csrfResult = checkCsrf(req);
    if (!csrfResult.valid) {
      return apiError(csrfResult.message || "Cross-origin request blocked", 403, "CSRF_BLOCKED");
    }

    const auth = await requireAuthenticatedUser(req);

    // 2. Rate Limiting (10 payment actions / min / client)
    const rateLimit = rateLimiter.check(`pay:${auth.user.id}`, RATE_LIMITS.PAYMENTS);
    if (!rateLimit.success) {
      const errRes = apiError("Too many payment attempts. Please try again later.", 429, "RATE_LIMIT_EXCEEDED");
      errRes.headers.set("Retry-After", String(rateLimit.resetTime));
      return errRes;
    }

    const body = await req.json().catch(() => ({}));

    const result = await createContractPayment(body, auth);

    if ("error" in result) {
      if (result.error === "FORBIDDEN") {
        return apiError(result.message, 403, "FORBIDDEN");
      }
      if (result.error === "NOT_FOUND") {
        return apiError(result.message, 404, "NOT_FOUND");
      }
      if (result.error === "DUPLICATE_PAYMENT") {
        return apiError(result.message, 409, "DUPLICATE_PAYMENT");
      }
      if (result.error === "AMOUNT_MISMATCH") {
        return apiError(result.message, 400, "AMOUNT_MISMATCH");
      }
      if (result.error === "INVALID_AMOUNT") {
        return apiError(result.message, 400, "INVALID_AMOUNT");
      }
      if (result.error === "INVALID_CURRENCY") {
        return apiError(result.message, 400, "INVALID_CURRENCY");
      }
      if (result.error === "PAYMENT_FAILED") {
        return apiError(result.message || "Payment failed", 402, "PAYMENT_FAILED");
      }
      return apiError((result as any).message || "Bad request", 400, "BAD_REQUEST");
    }

    return apiSuccess({ payment: result.payment, escrow: result.escrow }, 201);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("POST /api/payments error:", error);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;
    const payments = await listPayments(auth, { limit, offset });
    return apiSuccess(payments);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/payments error:", error);
    return apiError("Failed to fetch payments", 500, "INTERNAL_ERROR");
  }
}
