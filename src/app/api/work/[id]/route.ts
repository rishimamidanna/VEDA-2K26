import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { getWorkContractById, updateWorkContract } from "@/lib/server/work/service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);

    const result = await getWorkContractById(id, auth);

    if ("error" in result) {
      if (result.error === "NOT_FOUND") {
        return apiError("Work contract not found", 404, "NOT_FOUND");
      }
      if (result.error === "FORBIDDEN") {
        return apiError("You do not have permission to view this contract", 403, "FORBIDDEN");
      }
    }

    return apiSuccess(result.contract);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/work/[id] error:", error);
    return apiError("Failed to fetch contract", 500, "INTERNAL_ERROR");
  }
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);

    const body = await req.json().catch(() => ({}));
    const result = await updateWorkContract(id, body, auth);

    if ("error" in result) {
      if (result.error === "NOT_FOUND") {
        return apiError("Work contract not found", 404, "NOT_FOUND");
      }
      if (result.error === "FORBIDDEN") {
        return apiError("You do not have permission to modify this contract", 403, "FORBIDDEN");
      }
      if (result.error === "INVALID_STATUS") {
        return apiError(`Invalid work status: ${body.status}`, 400, "INVALID_STATUS");
      }
      if (result.error === "INVALID_PROGRESS") {
        return apiError("Progress must be an integer between 0 and 100", 400, "INVALID_PROGRESS");
      }
    }

    return apiSuccess(result.contract);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("PATCH /api/work/[id] error:", error);
    return apiError(error.message || "Failed to update contract", 400, "BAD_REQUEST");
  }
}
