import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, getCurrentUser, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { getStudentById, updateStudentProfile } from "@/lib/server/students/service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await getCurrentUser(req);

    const result = await getStudentById(id, auth);

    if ("error" in result && result.error === "NOT_FOUND") {
      return apiError("Student profile not found", 404, "NOT_FOUND");
    }

    return apiSuccess(result.student);
  } catch (error: any) {
    console.error("GET /api/students/[id] error:", error);
    return apiError("Failed to fetch student profile", 500, "INTERNAL_ERROR");
  }
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));

    const result = await updateStudentProfile(id, body, auth);

    if ("error" in result) {
      if (result.error === "NOT_FOUND") {
        return apiError("Student profile not found", 404, "NOT_FOUND");
      }
      if (result.error === "FORBIDDEN") {
        return apiError("You do not have permission to modify this profile", 403, "FORBIDDEN");
      }
    }

    return apiSuccess(result.student);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("PATCH /api/students/[id] error:", error);
    return apiError(error.message || "Failed to update profile", 400, "BAD_REQUEST");
  }
}
