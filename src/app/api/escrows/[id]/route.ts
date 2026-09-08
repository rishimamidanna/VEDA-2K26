import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { getEscrowById } from "@/lib/server/payments/service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);

    const result = await getEscrowById(id, auth);

    if ("error" in result) {
      if (result.error === "NOT_FOUND") {
        return apiError(result.message, 404, "NOT_FOUND");
      }
      if (result.error === "FORBIDDEN") {
        return apiError(result.message, 403, "FORBIDDEN");
      }
      return apiError((result as any).message || "Bad request", 400, "BAD_REQUEST");
    }

    return apiSuccess(result.escrow);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/escrows/[id] error:", error);
    return apiError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
