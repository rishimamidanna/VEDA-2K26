import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/server/api-response";
import { listStudents } from "@/lib/server/students/service";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const expertise = searchParams.get("expertise") || undefined;
    const experience = searchParams.get("experience") || undefined;
    const availability = searchParams.get("availability") || undefined;
    const skillsParam = searchParams.get("skills") || searchParams.get("skill");
    const skills = skillsParam ? skillsParam.split(",").map((s) => s.trim()) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;

    const students = await listStudents({
      search,
      expertise,
      experience,
      availability,
      skills,
      limit,
      offset,
    });

    return apiSuccess(students);
  } catch (error: any) {
    console.error("GET /api/students error:", error);
    return apiError("Failed to fetch talent directory", 500, "INTERNAL_ERROR");
  }
}
