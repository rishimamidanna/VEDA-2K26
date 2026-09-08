import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { getApplicationsForUser } from "@/lib/server/applications/service";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    const applications = await getApplicationsForUser(auth);

    return apiSuccess(applications);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/applications error:", error);
    return apiError("Failed to fetch applications", 500, "INTERNAL_ERROR");
  }
}
