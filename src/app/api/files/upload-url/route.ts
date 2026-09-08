import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { prepareSignedUpload, StorageError } from "@/lib/server/storage/service";
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

    // 2. Rate Limiting (20 uploads / min / user)
    const rateLimit = rateLimiter.check(`upload:${auth.user.id}`, RATE_LIMITS.UPLOADS);
    if (!rateLimit.success) {
      const errRes = apiError("Upload rate limit exceeded. Please wait before uploading again.", 429, "RATE_LIMIT_EXCEEDED");
      errRes.headers.set("Retry-After", String(rateLimit.resetTime));
      return errRes;
    }

    const body = await req.json().catch(() => ({}));

    const { fileName, fileSize, mimeType, category, contextId } = body;
    if (!fileName || !fileSize || !mimeType || !category) {
      return apiError("fileName, fileSize, mimeType, and category are required", 400, "MISSING_FIELDS");
    }

    const result = await prepareSignedUpload(auth, {
      fileName,
      fileSize: Number(fileSize),
      mimeType,
      category,
      contextId,
    });

    return apiSuccess(result, 201);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    if (error instanceof StorageError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("POST /api/files/upload-url error:", error);
    return apiError("Failed to prepare upload URL", 500, "INTERNAL_ERROR");
  }
}
