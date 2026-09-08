import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { getConversation, MessagingError } from "@/lib/server/messaging/service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);
    const conversation = await getConversation(id, auth);
    return apiSuccess(conversation);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    if (error instanceof MessagingError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/conversations/[id] error:", error);
    return apiError("Failed to fetch conversation", 500, "INTERNAL_ERROR");
  }
}
