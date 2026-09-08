import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireRole } from "@/lib/server/auth/context";
import { UserRole } from "@prisma/client";
import { getClientDashboardMetrics } from "@/lib/server/dashboard/client-service";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, UserRole.CLIENT);
    const result = await getClientDashboardMetrics(auth);

    if ("error" in result) {
      if (result.error === "FORBIDDEN") {
        return apiError("Forbidden", 403, "FORBIDDEN");
      }
      return apiError(result.message || "Not found", 404, "NOT_FOUND");
    }

    return apiSuccess(result);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/dashboard/client error:", error);
    return apiError("Failed to fetch client dashboard metrics", 500, "INTERNAL_ERROR");
  }
}
