import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { addPortfolioProject } from "@/lib/server/students/service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));

    const result = await addPortfolioProject(id, body, auth);

    if ("error" in result) {
      if (result.error === "NOT_FOUND") {
        return apiError("Student profile not found", 404, "NOT_FOUND");
      }
      if (result.error === "FORBIDDEN") {
        return apiError("You do not have permission to add portfolio to this profile", 403, "FORBIDDEN");
      }
      if (result.error === "BAD_REQUEST") {
        return apiError(result.message || "Invalid input", 400, "BAD_REQUEST");
      }
    }

    return apiSuccess(result.project, 201);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("POST /api/students/[id]/portfolio error:", error);
    return apiError("Failed to add portfolio project", 500, "INTERNAL_ERROR");
  }
}
