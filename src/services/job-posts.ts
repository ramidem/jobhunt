import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { normalizeJobUrl } from "@/lib/job-url";
import { isApplicationStatus, type ApplicationStatus } from "@/lib/tracker";
import { fail, ok, type Result } from "@/services/result";

const COLUMNS = "id, url, url_norm, raw_description, status, company, title, created_at";
const UNIQUE_VIOLATION = "23505";

const saveJobSchema = z.object({
  url: z.string().trim().min(1, "Enter a link."),
  description: z
    .string()
    .trim()
    .min(50, "Description must be at least 50 characters.")
    .max(50000, "Description must be at most 50000 characters."),
  status: z.string(),
});

export type JobPost = {
  id: number;
  url: string;
  urlNorm: string;
  description: string;
  status: ApplicationStatus;
  company: string | null;
  title: string | null;
  createdAt: string;
};

export type SavedJob =
  | { status: "saved"; job: JobPost }
  | { status: "duplicate"; job: JobPost | null };

type JobPostRow = {
  id: number;
  url: string;
  url_norm: string;
  raw_description: string;
  status: ApplicationStatus;
  company: string | null;
  title: string | null;
  created_at: string;
};

function isJobPostRow(value: unknown): value is JobPostRow {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "number" &&
    typeof row.url === "string" &&
    typeof row.url_norm === "string" &&
    typeof row.raw_description === "string" &&
    typeof row.status === "string" &&
    isApplicationStatus(row.status) &&
    (row.company === null || typeof row.company === "string") &&
    (row.title === null || typeof row.title === "string") &&
    typeof row.created_at === "string"
  );
}

function mapJob(row: JobPostRow): JobPost {
  return {
    id: row.id,
    url: row.url,
    urlNorm: row.url_norm,
    description: row.raw_description,
    status: row.status,
    company: row.company,
    title: row.title,
    createdAt: row.created_at,
  };
}

// Talks to job_posts. The client is passed in, so tests can supply a fake one.
export function createJobPostsService(client: SupabaseClient) {
  return {
    async list(userId: string): Promise<Result<JobPost[]>> {
      const { data, error } = await client
        .from("job_posts")
        .select(COLUMNS)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) {
        return fail(error.message);
      }
      if (!Array.isArray(data) || !data.every(isJobPostRow)) {
        return fail("Unexpected job post from the database.");
      }
      return ok(data.map(mapJob));
    },

    async save(userId: string, input: unknown): Promise<Result<SavedJob>> {
      const parsed = saveJobSchema.safeParse(input);
      if (!parsed.success) {
        return fail(parsed.error.issues[0]?.message ?? "Check the job and try again.");
      }
      if (!isApplicationStatus(parsed.data.status)) {
        return fail("Choose a status.");
      }

      // Med's helper returns null instead of throwing. An internal NBSP is null here and
      // still accepted by normalize_job_url, so those links are refused in the form.
      const urlNorm = normalizeJobUrl(parsed.data.url);
      if (!urlNorm) {
        return fail("Enter an http or https link.");
      }

      const inserted = await client
        .from("job_posts")
        .insert({
          url: parsed.data.url,
          url_norm: urlNorm,
          raw_description: parsed.data.description,
          status: parsed.data.status,
        })
        .select(COLUMNS)
        .single();
      if (!inserted.error) {
        if (!isJobPostRow(inserted.data)) {
          return fail("Unexpected job post from the database.");
        }
        return ok({ status: "saved", job: mapJob(inserted.data) });
      }
      if (inserted.error.code !== UNIQUE_VIOLATION) {
        return fail(inserted.error.message);
      }

      // Lookup uses the client normalizer. If the database collation sorts mixed-case
      // query keys differently, this misses and the form still says the link is saved.
      const existing = await client
        .from("job_posts")
        .select(COLUMNS)
        .eq("user_id", userId)
        .eq("url_norm", urlNorm)
        .maybeSingle();
      if (existing.error || !isJobPostRow(existing.data)) {
        return ok({ status: "duplicate", job: null });
      }
      return ok({ status: "duplicate", job: mapJob(existing.data) });
    },

    async updateStatus(userId: string, id: number, status: string): Promise<Result<null>> {
      if (!isApplicationStatus(status)) {
        return fail("Choose a status.");
      }
      const { error } = await client.from("job_posts").update({ status }).eq("id", id).eq("user_id", userId);
      return error ? fail(error.message) : ok(null);
    },
  };
}
