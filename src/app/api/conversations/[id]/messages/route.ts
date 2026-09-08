import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { listMessages, sendMessage, MessagingError } from "@/lib/server/messaging/service";
import { checkCsrf } from "@/lib/server/security/csrf";
import { rateLimiter, RATE_LIMITS } from "@/lib/server/security/rate-limit";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const beforeParam = searchParams.get("before") || undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const messages = await listMessages(id, auth, { limit, before: beforeParam });
    return apiSuccess(messages);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    if (error instanceof MessagingError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/conversations/[id]/messages error:", error);
    return apiError("Failed to fetch messages", 500, "INTERNAL_ERROR");
  }
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

    // 2. Rate Limiting (30 messages / min / user)
    const rateLimit = rateLimiter.check(`msg:${auth.user.id}`, RATE_LIMITS.MESSAGING);
    if (!rateLimit.success) {
      const errRes = apiError("Too many messages sent. Please slow down.", 429, "RATE_LIMIT_EXCEEDED");
      errRes.headers.set("Retry-After", String(rateLimit.resetTime));
      return errRes;
    }

    const body = await req.json().catch(() => ({}));

    const message = await sendMessage(id, auth, {
      content: body.content,
      attachmentName: body.attachmentName || body.attachment?.name,
      attachmentSize: body.attachmentSize || body.attachment?.size,
      attachmentUrl: body.attachmentUrl || body.attachment?.url,
    });

    return apiSuccess(message, 201);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    if (error instanceof MessagingError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("POST /api/conversations/[id]/messages error:", error);
    return apiError(error.message || "Failed to send message", 400, "BAD_REQUEST");
  }
}
