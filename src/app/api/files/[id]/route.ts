import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { AuthError, requireAuthenticatedUser } from "@/lib/server/auth/context";
import { getAuthorizedDownloadUrl, deleteStoredFile, StorageError } from "@/lib/server/storage/service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);
    const result = await getAuthorizedDownloadUrl(id, auth);
    return apiSuccess(result);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    if (error instanceof StorageError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("GET /api/files/[id] error:", error);
    return apiError("Failed to fetch file metadata", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const auth = await requireAuthenticatedUser(req);
    const result = await deleteStoredFile(id, auth);
    return apiSuccess(result);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return apiError(error.message, error.status, error.code);
    }
    if (error instanceof StorageError) {
      return apiError(error.message, error.status, error.code);
    }
    console.error("DELETE /api/files/[id] error:", error);
    return apiError("Failed to delete file", 500, "INTERNAL_ERROR");
  }
}
