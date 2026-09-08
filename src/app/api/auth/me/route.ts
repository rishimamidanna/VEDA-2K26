import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { requireAuthenticatedUser, AuthError } from "@/lib/server/auth/context";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    const sanitizedUser = {
      id: auth.user.id,
      email: auth.user.email,
      name: auth.user.name,
      role: auth.user.role,
      avatar: auth.user.avatar,
      studentProfile: auth.studentProfile,
      clientProfile: auth.clientProfile,
    };

    return apiSuccess({ user: sanitizedUser });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    return apiError("Failed to fetch session", 500, "INTERNAL_ERROR");
  }
}
