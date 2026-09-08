import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { getClientById, updateClientProfile } from "@/lib/server/clients/service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const result = await getClientById(id);

    if ("error" in result && result.error === "NOT_FOUND") {
      return apiError("Client profile not found", 404, "NOT_FOUND");
    }

    return apiSuccess(result.client);
  } catch (error: any) {
    console.error("GET /api/clients/[id] error:", error);
    return apiError("Failed to fetch client profile", 500, "INTERNAL_ERROR");
  }
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));

    const result = await updateClientProfile(id, body, auth);

    if ("error" in result) {
      if (result.error === "NOT_FOUND") {
        return apiError("Client profile not found", 404, "NOT_FOUND");
      }
      if (result.error === "FORBIDDEN") {
        return apiError("You do not have permission to modify this profile", 403, "FORBIDDEN");
      }
    }

    return apiSuccess(result.client);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("PATCH /api/clients/[id] error:", error);
    return apiError(error.message || "Failed to update client profile", 400, "BAD_REQUEST");
  }
}
