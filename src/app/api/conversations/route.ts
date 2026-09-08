import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { listConversations, createOrGetConversation, MessagingError } from "@/lib/server/messaging/service";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    const conversations = await listConversations(auth);
    return apiSuccess(conversations);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    if (error instanceof MessagingError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/conversations error:", error);
    return apiError("Failed to fetch conversations", 500, "INTERNAL_ERROR");
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));

    const { projectId, studentId } = body;
    if (!projectId || !studentId) {
      return apiError("Both projectId and studentId are required", 400, "BAD_REQUEST");
    }

    const conversation = await createOrGetConversation(projectId, studentId, auth);
    return apiSuccess(conversation, 201);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    if (error instanceof MessagingError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("POST /api/conversations error:", error);
    return apiError("Failed to create conversation", 500, "INTERNAL_ERROR");
  }
}
