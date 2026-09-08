import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { getStudentEarnings } from "@/lib/server/payments/service";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    const result = await getStudentEarnings(auth);

    if ("error" in result) {
      if (result.error === "FORBIDDEN") {
        return apiError(result.message, 403, "FORBIDDEN");
      }
      return apiError((result as any).message || "Bad request", 400, "BAD_REQUEST");
    }

    return apiSuccess(result);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/student/earnings error:", error);
    return apiError("Failed to fetch earnings", 500, "INTERNAL_ERROR");
  }
}
