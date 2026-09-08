import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireClient } from "@/lib/server/auth/context";
import { getProjectById, updateProject } from "@/lib/server/projects/service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return apiError("Project not found", 404, "NOT_FOUND");
    }

    return apiSuccess(project);
  } catch (error: any) {
    console.error("GET /api/projects/[id] error:", error);
    return apiError("Failed to fetch project", 500, "INTERNAL_ERROR");
  }
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireClient(req);

    const body = await req.json().catch(() => ({}));
    const result = await updateProject(id, auth.clientProfile.id, body);

    if ("error" in result) {
      if (result.error === "NOT_FOUND") {
        return apiError("Project not found", 404, "NOT_FOUND");
      }
      if (result.error === "FORBIDDEN") {
        return apiError("You do not have permission to modify this project", 403, "FORBIDDEN");
      }
    }

    return apiSuccess(result.project);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("PATCH /api/projects/[id] error:", error);
    return apiError(error.message || "Failed to update project", 400, "BAD_REQUEST");
  }
}
