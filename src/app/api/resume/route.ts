import { NextResponse } from "next/server";
import { resume } from "@/data/resume";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(resume, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
