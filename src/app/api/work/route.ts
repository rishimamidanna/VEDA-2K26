import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { getWorkContractsForUser } from "@/lib/server/work/service";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    const contracts = await getWorkContractsForUser(auth);

    return apiSuccess(contracts);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/work error:", error);
    return apiError("Failed to fetch work contracts", 500, "INTERNAL_ERROR");
  }
}
