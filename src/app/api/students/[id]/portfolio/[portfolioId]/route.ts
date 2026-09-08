import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { deletePortfolioProject } from "@/lib/server/students/service";

interface RouteProps {
  params: Promise<{ id: string; portfolioId: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const { id, portfolioId } = await params;
    const auth = await requireAuthenticatedUser(req);

    const result = await deletePortfolioProject(id, portfolioId, auth);

    if ("error" in result) {
      if (result.error === "NOT_FOUND") {
        return apiError("Portfolio project not found", 404, "NOT_FOUND");
      }
      if (result.error === "FORBIDDEN") {
        return apiError("You do not have permission to delete this project", 403, "FORBIDDEN");
      }
    }

    return apiSuccess({ message: "Portfolio project deleted successfully" });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("DELETE /api/students/[id]/portfolio/[portfolioId] error:", error);
    return apiError("Failed to delete portfolio project", 500, "INTERNAL_ERROR");
  }
}
