import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireClient, requireStudent } from "@/lib/server/auth/context";
import { createApplication, getProjectApplicants } from "@/lib/server/applications/service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteProps) {
  try {
    const { id: projectId } = await params;
    // Only authenticated STUDENT users may apply
    const auth = await requireStudent(req);

    const body = await req.json().catch(() => ({}));
    const result = await createApplication(projectId, auth.studentProfile.id, body);

    if ("error" in result) {
      if (result.error === "PROJECT_NOT_FOUND") {
        return apiError("Project not found", 404, "NOT_FOUND");
      }
      if (result.error === "PROJECT_CLOSED") {
        return apiError("Project is closed and no longer accepting applications", 400, "PROJECT_CLOSED");
      }
      if (result.error === "DUPLICATE_APPLICATION") {
        return apiError("You have already submitted an application to this project", 409, "DUPLICATE_APPLICATION");
      }
    }

    return apiSuccess(result.application, 201);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("POST /api/projects/[id]/applications error:", error);
    return apiError(error.message || "Failed to submit application", 400, "BAD_REQUEST");
  }
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id: projectId } = await params;
    // Only the owning CLIENT may access applicant pipeline for this project
    const auth = await requireClient(req);

    const result = await getProjectApplicants(projectId, auth.clientProfile.id);

    if ("error" in result) {
      if (result.error === "PROJECT_NOT_FOUND") {
        return apiError("Project not found", 404, "NOT_FOUND");
      }
      if (result.error === "FORBIDDEN") {
        return apiError("You do not have permission to view applicants for this project", 403, "FORBIDDEN");
      }
    }

    return apiSuccess(result.applications);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/projects/[id]/applications error:", error);
    return apiError("Failed to fetch project applicants", 500, "INTERNAL_ERROR");
  }
}
