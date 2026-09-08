import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireClient } from "@/lib/server/auth/context";
import { createProject, listProjects } from "@/lib/server/projects/service";
import { checkCsrf } from "@/lib/server/security/csrf";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const clientId = searchParams.get("clientId") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;

    const projects = await listProjects({ status, category, search, clientId, limit, offset });
    return apiSuccess(projects);
  } catch (error: any) {
    console.error("GET /api/projects error:", error);
    return apiError("Failed to fetch projects", 500, "INTERNAL_ERROR");
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. CSRF Defense
    const csrfResult = checkCsrf(req);
    if (!csrfResult.valid) {
      return apiError(csrfResult.message || "Cross-origin request blocked", 403, "CSRF_BLOCKED");
    }

    // Only authenticated CLIENT users can create projects
    const auth = await requireClient(req);

    const body = await req.json().catch(() => ({}));
    const newProject = await createProject(auth.clientProfile.id, body);

    return apiSuccess(newProject, 201);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("POST /api/projects error:", error);
    return apiError(error.message || "Failed to create project", 400, "BAD_REQUEST");
  }
}
