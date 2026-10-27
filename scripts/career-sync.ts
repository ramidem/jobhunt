// Pulls the extraction queue, or submits one extraction, as the career database role.
// CAREER_DATABASE_URL is a direct connection for that role. It is not the service role key.
import { readFileSync } from "node:fs";
import pg from "pg";
import { parseExtractionPayload } from "../src/lib/extraction.ts";

const usage = "Usage: npm run career:sync -- pull | submit <job_id> <payload.json>";

async function main() {
  const databaseUrl = process.env.CAREER_DATABASE_URL;
  if (!databaseUrl) {
    process.stderr.write("Set CAREER_DATABASE_URL to the career role connection string.\n");
    process.exitCode = 1;
    return;
  }

  const command = process.argv[2] ?? "pull";
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    if (command === "pull") {
      const result = await client.query(
        `select id, url, extraction_status, raw_description
         from public.job_posts
         where extraction_status in ('new', 'needs_update')
         order by created_at`,
      );
      process.stdout.write(`${JSON.stringify(result.rows, null, 2)}\n`);
      return;
    }

    if (command === "submit") {
      const id = Number(process.argv[3]);
      const file = process.argv[4];
      if (!Number.isInteger(id) || id <= 0 || !file) {
        process.stderr.write(`${usage}\n`);
        process.exitCode = 1;
        return;
      }
      const payload = parseExtractionPayload(JSON.parse(readFileSync(file, "utf8")));
      const result = await client.query("select public.submit_extraction($1, $2::jsonb) as result", [
        id,
        JSON.stringify(payload),
      ]);
      process.stdout.write(`${JSON.stringify(result.rows[0]?.result ?? null, null, 2)}\n`);
      return;
    }

    process.stderr.write(`${usage}\n`);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Career sync failed."}\n`);
  process.exitCode = 1;
});
