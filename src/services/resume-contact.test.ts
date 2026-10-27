import { describe, expect, it } from "vitest";
import { createResumeContactService } from "@/services/resume-contact";
import { createFakeSupabase } from "@/services/testing/fake-supabase";

describe("resume contact service", () => {
  it("maps the owner's row and asks only for that user", async () => {
    const { client, queryCalls, answerQuery } = createFakeSupabase();
    answerQuery({ data: { email: "owner@example.com", phone: "+1 555 0100" } });

    const result = await createResumeContactService(client).getOwn("user-1");

    expect(result).toEqual({ ok: true, data: { email: "owner@example.com", phone: "+1 555 0100" } });
    expect(queryCalls).toEqual([
      ["from", "resume_contact"],
      ["select", "email, phone"],
      ["eq", "user_id", "user-1"],
      ["maybeSingle"],
    ]);
  });

  it("returns null when the user has no contact row", async () => {
    const { client, answerQuery } = createFakeSupabase();
    answerQuery({ data: null });

    expect(await createResumeContactService(client).getOwn("user-1")).toEqual({ ok: true, data: null });
  });

  it("keeps a missing phone or email as null", async () => {
    const { client, answerQuery } = createFakeSupabase();
    answerQuery({ data: { email: "owner@example.com", phone: null } });

    expect(await createResumeContactService(client).getOwn("user-1")).toEqual({
      ok: true,
      data: { email: "owner@example.com", phone: null },
    });
  });

  it("returns the database error message", async () => {
    const { client, answerQuery } = createFakeSupabase();
    answerQuery({ error: { message: "permission denied" } });

    expect(await createResumeContactService(client).getOwn("user-1")).toEqual({
      ok: false,
      error: "permission denied",
    });
  });
});
