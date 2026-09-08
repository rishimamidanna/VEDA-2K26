import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { listEscrows } from "@/lib/server/payments/service";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(req);
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;
    const escrows = await listEscrows(auth, { limit, offset });
    return apiSuccess(escrows);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/escrows error:", error);
    return apiError("Failed to fetch escrows", 500, "INTERNAL_ERROR");
  }
}
