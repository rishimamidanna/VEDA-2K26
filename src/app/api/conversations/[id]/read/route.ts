import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { markConversationRead, MessagingError } from "@/lib/server/messaging/service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);
    const result = await markConversationRead(id, auth);
    return apiSuccess(result);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    if (error instanceof MessagingError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("PATCH /api/conversations/[id]/read error:", error);
    return apiError("Failed to mark conversation as read", 500, "INTERNAL_ERROR");
  }
}
