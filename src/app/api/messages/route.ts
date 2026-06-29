import { NextResponse } from "next/server";
import { messageSchema } from "@/lib/resume-schema";
import { saveResumeMessage } from "@/lib/firebase";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const result = await saveResumeMessage(parsed.data);

  return NextResponse.json({
    ok: true,
    stored: result.stored,
  });
}
