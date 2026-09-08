import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/server/api-response";
import { clearSessionCookie } from "@/lib/server/auth/session";

export async function POST(req: NextRequest) {
  const response = apiSuccess({ message: "Logged out successfully" });
  clearSessionCookie(response);
  return response;
}
