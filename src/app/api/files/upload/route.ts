import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { uploadFileBuffer, StorageError, FileCategory } from "@/lib/server/storage/service";
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

    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) as FileCategory;
    const contextId = (formData.get("contextId") as string) || undefined;

    if (!file) {
      return apiError("No file provided in form data", 400, "MISSING_FILE");
    }
    if (!category) {
      return apiError("category is required", 400, "MISSING_CATEGORY");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadFileBuffer(auth, buffer, {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
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
    console.error("POST /api/files/upload error:", error);
    return apiError(error.message || "Failed to upload file", 500, "INTERNAL_ERROR");
  }
}
