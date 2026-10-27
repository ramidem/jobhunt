import { describe, expect, it } from "vitest";
import { createJobPostsService } from "@/services/job-posts";
import { createFakeSupabase } from "@/services/testing/fake-supabase";

const description = "a".repeat(50);
const row = {
  id: 7,
  url: "https://www.linkedin.com/jobs/view/4389012345/?trackingId=abc",
  url_norm: "https://www.linkedin.com/jobs/view/4389012345/",
  raw_description: description,
  status: "Saved",
  company: null,
  title: "Engineer",
  created_at: "2026-10-27T00:00:00.000Z",
};

const job = {
  id: 7,
  url: row.url,
  urlNorm: row.url_norm,
  description,
  status: "Saved",
  company: null,
  title: "Engineer",
  createdAt: row.created_at,
};

describe("job posts service", () => {
  it("lists the signed-in user's rows, newest first", async () => {
    const { client, queryCalls, answerQuery } = createFakeSupabase();
    answerQuery({ data: [row] });

    const result = await createJobPostsService(client).list("user-1");

    expect(result).toEqual({ ok: true, data: [job] });
    expect(queryCalls).toEqual([
      ["from", "job_posts"],
      ["select", "id, url, url_norm, raw_description, status, company, title, created_at"],
      ["eq", "user_id", "user-1"],
      ["order", "created_at", { ascending: false }],
    ]);
  });

  it("rejects a short description before calling the database", async () => {
    const { client, queryCalls } = createFakeSupabase();

    const result = await createJobPostsService(client).save("user-1", {
      url: "https://example.com/jobs/1",
      description: "too short",
      status: "Saved",
    });

    expect(result).toEqual({ ok: false, error: "Description must be at least 50 characters." });
    expect(queryCalls).toEqual([]);
  });

  it("rejects a non-http link", async () => {
    const { client, queryCalls } = createFakeSupabase();

    const result = await createJobPostsService(client).save("user-1", {
      url: "ftp://example.com/jobs/1",
      description,
      status: "Saved",
    });

    expect(result).toEqual({ ok: false, error: "Enter an http or https link." });
    expect(queryCalls).toEqual([]);
  });

  it("inserts the normalized link", async () => {
    const { client, queryCalls, answerQuery } = createFakeSupabase();
    answerQuery({ data: row });

    const result = await createJobPostsService(client).save("user-1", {
      url: "https://www.linkedin.com/jobs/search/?currentJobId=4389012345&utm_source=share",
      description: `  ${description}  `,
      status: "Applied",
    });

    expect(result.ok).toBe(true);
    expect(queryCalls[0]).toEqual(["from", "job_posts"]);
    expect(queryCalls[1]).toEqual([
      "insert",
      {
        url: "https://www.linkedin.com/jobs/search/?currentJobId=4389012345&utm_source=share",
        url_norm: "https://www.linkedin.com/jobs/view/4389012345/",
        raw_description: description,
        status: "Applied",
      },
    ]);
  });

  it("returns the existing row when the normalized link is already saved", async () => {
    const { client, answerQueryOnce } = createFakeSupabase();
    answerQueryOnce({ data: null, error: { message: "duplicate key", code: "23505" } });
    answerQueryOnce({ data: row });

    const result = await createJobPostsService(client).save("user-1", {
      url: "https://www.linkedin.com/jobs/view/4389012345/?trackingId=abc",
      description,
      status: "Saved",
    });

    expect(result).toEqual({ ok: true, data: { status: "duplicate", job } });
  });

  it("updates only that user's status", async () => {
    const { client, queryCalls, answerQuery } = createFakeSupabase();
    answerQuery({ data: null });

    const result = await createJobPostsService(client).updateStatus("user-1", 7, "Interviewing");

    expect(result).toEqual({ ok: true, data: null });
    expect(queryCalls).toEqual([
      ["from", "job_posts"],
      ["update", { status: "Interviewing" }],
      ["eq", "id", 7],
      ["eq", "user_id", "user-1"],
    ]);
  });
});
