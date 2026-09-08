import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { getAuthorizedDownloadUrl, StorageError } from "@/lib/server/storage/service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);

    const { searchParams } = new URL(req.url);
    const redirect = searchParams.get("redirect") === "true";

    const result = await getAuthorizedDownloadUrl(id, auth);

    if (redirect) {
      return NextResponse.redirect(result.downloadUrl);
    }

    return apiSuccess(result);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    if (error instanceof StorageError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/files/[id]/download error:", error);
    return apiError("Failed to generate download URL", 500, "INTERNAL_ERROR");
  }
}
