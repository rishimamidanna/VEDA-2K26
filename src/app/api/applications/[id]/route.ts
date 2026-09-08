import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { getApplicationById, updateApplicationStatus } from "@/lib/server/applications/service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);

    const result = await getApplicationById(id, auth);

    if ("error" in result) {
      if (result.error === "NOT_FOUND") {
        return apiError("Application not found", 404, "NOT_FOUND");
      }
      if (result.error === "FORBIDDEN") {
        return apiError("You do not have permission to view this application", 403, "FORBIDDEN");
      }
    }

    return apiSuccess(result.application);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/applications/[id] error:", error);
    return apiError("Failed to fetch application", 500, "INTERNAL_ERROR");
  }
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);

    const body = await req.json().catch(() => ({}));
    if (!body.status) {
      return apiError("Status field is required", 400, "MISSING_STATUS");
    }

    const result = await updateApplicationStatus(id, body.status, auth);

    if ("error" in result) {
      if (result.error === "NOT_FOUND") {
        return apiError("Application not found", 404, "NOT_FOUND");
      }
      if (result.error === "FORBIDDEN") {
        return apiError("You do not have permission to modify this application", 403, "FORBIDDEN");
      }
      if (result.error === "INVALID_STATUS") {
        return apiError(`Invalid status value provided: ${body.status}`, 400, "INVALID_STATUS");
      }
      if (result.error === "INVALID_TRANSITION") {
        return apiError(
          `Invalid state transition from '${result.currentStatus}' to '${result.targetStatus}'`,
          422,
          "INVALID_STATE_TRANSITION"
        );
      }
    }

    return apiSuccess(result);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("PATCH /api/applications/[id] error:", error);
    return apiError(error.message || "Failed to update application", 400, "BAD_REQUEST");
  }
}
