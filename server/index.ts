// Local server for the job-hunt workspace: serves the static export in out/ and a small
// SQLite-backed JSON API under /api. Run with `npm run serve` after `npm run build`.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize } from "node:path";
import { linkJobSkills, openDb, upsertCompany } from "./db.ts";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4173);
const outDir = join(import.meta.dirname, "..", "out");
const db = openDb();

const STATUSES = ["Saved", "Applied", "Interviewing", "Offer", "Rejected", "Withdrawn"];
const SKILL_STATUSES = ["know", "learning", "want"];

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new Error();
    }
    return value;
  } catch {
    throw new HttpError(400, "Body must be a JSON object");
  }
}

function text(body: Record<string, unknown>, key: string, required = false) {
  const value = body[key];
  if (value === undefined && !required) {
    return undefined;
  }
  if (typeof value !== "string" || (required && !value.trim())) {
    throw new HttpError(400, `${key} must be a ${required ? "non-empty " : ""}string`);
  }
  return value.trim();
}

function oneOf(value: string | undefined, allowed: string[], key: string) {
  if (value !== undefined && !allowed.includes(value)) {
    throw new HttpError(400, `${key} must be one of ${allowed.join(", ")}`);
  }
  return value;
}

// Match % is computed from the skills linked to each job, so it follows the Skills page.
function listApplications() {
  const rows = db
    .prepare(
      `SELECT a.id, a.job_id AS jobId, j.title AS role, c.name AS company, j.url, j.source,
              j.details, j.description AS jobDescription, j.created_at AS createdAt,
              a.status, a.applied_on AS appliedOn, a.notes
         FROM applications a
         JOIN jobs j ON j.id = a.job_id
         JOIN companies c ON c.id = j.company_id
        ORDER BY j.created_at DESC, a.id ASC`,
    )
    .all() as Record<string, unknown>[];
  const skillRows = db
    .prepare(
      `SELECT js.job_id AS jobId, s.name, s.status
         FROM job_skills js JOIN skills s ON s.id = js.skill_id
        ORDER BY s.name`,
    )
    .all() as { jobId: number; name: string; status: string }[];

  return rows.map((row) => {
    const skills = skillRows
      .filter((skill) => skill.jobId === row.jobId)
      .map(({ name, status }) => ({ name, status }));
    const known = skills.filter((skill) => skill.status === "know").length;
    return {
      ...row,
      skills,
      matchPercent: skills.length > 0 ? Math.round((known / skills.length) * 100) : null,
    };
  });
}

function listSkills() {
  return db
    .prepare(
      `SELECT s.id, s.name, s.status, COUNT(js.job_id) AS demand
         FROM skills s LEFT JOIN job_skills js ON js.skill_id = s.id
        GROUP BY s.id
        ORDER BY demand DESC, s.name`,
    )
    .all();
}

function listQualifications() {
  const meta = Object.fromEntries(
    (db.prepare("SELECT key, value FROM meta WHERE key LIKE 'qualifications.%'").all() as {
      key: string;
      value: string;
    }[]).map(({ key, value }) => [key.replace("qualifications.", ""), value]),
  );
  const roles = db
    .prepare("SELECT id, title, updated FROM qualification_roles ORDER BY id")
    .all() as { id: number; title: string; updated: string | null }[];
  const lines = db
    .prepare(
      `SELECT rq.role_id AS roleId, l.id, l.text, l.hidden
         FROM role_qualifications rq JOIN qualification_lines l ON l.id = rq.line_id
        ORDER BY rq.role_id, rq.position`,
    )
    .all() as { roleId: number; id: number; text: string; hidden: number }[];
  const byRole = new Map<number, { id: number; text: string; hidden: boolean }[]>();
  for (const line of lines) {
    const list = byRole.get(line.roleId) ?? [];
    list.push({ id: line.id, text: line.text, hidden: line.hidden === 1 });
    byRole.set(line.roleId, list);
  }
  return {
    source: meta.source ?? "",
    note: meta.note ?? "",
    roles: roles.map((role) => ({ ...role, lines: byRole.get(role.id) ?? [] })),
  };
}

function update(table: string, id: number, fields: Record<string, unknown>) {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    throw new HttpError(400, "Nothing to update");
  }
  const result = db
    .prepare(`UPDATE ${table} SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`)
    .run(...(entries.map(([, value]) => value) as (string | number)[]), id);
  if (result.changes === 0) {
    throw new HttpError(404, "Not found");
  }
}

async function handleApi(req: IncomingMessage, res: ServerResponse, path: string) {
  const method = req.method ?? "GET";
  const match = path.match(/^\/api\/([a-z-]+)(?:\/(\d+))?$/);
  if (!match) {
    return false;
  }
  const [, resource, rawId] = match;
  const id = rawId ? Number(rawId) : undefined;

  if (resource === "applications") {
    if (method === "GET" && id === undefined) {
      send(res, 200, listApplications());
    } else if (method === "POST" && id === undefined) {
      const body = await readJson(req);
      const skills = Array.isArray(body.skills)
        ? body.skills.filter((value): value is string => typeof value === "string" && !!value.trim())
        : [];
      db.exec("BEGIN");
      try {
        const { id: jobId } = db
          .prepare(
            `INSERT INTO jobs (company_id, title, url, description) VALUES (?, ?, ?, ?) RETURNING id`,
          )
          .get(
            upsertCompany(db, text(body, "company", true)!),
            text(body, "role", true)!,
            text(body, "url") ?? "",
            text(body, "jobDescription") ?? "",
          ) as { id: number };
        linkJobSkills(db, jobId, skills);
        db.prepare("INSERT INTO applications (job_id) VALUES (?)").run(jobId);
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
      send(res, 201, listApplications());
    } else if (method === "PATCH" && id !== undefined) {
      const body = await readJson(req);
      update("applications", id, {
        status: oneOf(text(body, "status"), STATUSES, "status"),
        applied_on: text(body, "appliedOn"),
        notes: text(body, "notes"),
      });
      send(res, 200, listApplications());
    } else if (method === "DELETE" && id !== undefined) {
      // Deleting the job removes the application and its skill links.
      db.prepare("DELETE FROM jobs WHERE id = (SELECT job_id FROM applications WHERE id = ?)").run(id);
      send(res, 200, listApplications());
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    return true;
  }

  if (resource === "skills") {
    if (method === "GET" && id === undefined) {
      send(res, 200, listSkills());
    } else if (method === "POST" && id === undefined) {
      const body = await readJson(req);
      const name = text(body, "name", true)!;
      const status = oneOf(text(body, "status"), SKILL_STATUSES, "status") ?? "want";
      db.prepare("INSERT INTO skills (name, status) VALUES (?, ?) ON CONFLICT(name) DO NOTHING").run(
        name,
        status,
      );
      send(res, 201, listSkills());
    } else if (method === "PATCH" && id !== undefined) {
      const body = await readJson(req);
      update("skills", id, { status: oneOf(text(body, "status"), SKILL_STATUSES, "status") });
      send(res, 200, listSkills());
    } else if (method === "DELETE" && id !== undefined) {
      db.prepare("DELETE FROM skills WHERE id = ?").run(id);
      send(res, 200, listSkills());
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    return true;
  }

  if (resource === "qualifications" && method === "GET" && id === undefined) {
    send(res, 200, listQualifications());
    return true;
  }

  if (resource === "qualification-lines" && method === "PATCH" && id !== undefined) {
    const body = await readJson(req);
    if (typeof body.hidden !== "boolean") {
      throw new HttpError(400, "hidden must be a boolean");
    }
    update("qualification_lines", id, { hidden: body.hidden ? 1 : 0 });
    send(res, 200, listQualifications());
    return true;
  }

  return false;
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function serveStatic(res: ServerResponse, path: string) {
  let file = normalize(join(outDir, decodeURIComponent(path)));
  if (!file.startsWith(outDir)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) {
    file = join(file, "index.html");
  } else if (!existsSync(file) && existsSync(`${file}.html`)) {
    file = `${file}.html`;
  }
  if (!existsSync(file)) {
    res.writeHead(404, { "Content-Type": MIME[".html"] });
    createReadStream(join(outDir, "404.html")).pipe(res);
    return;
  }
  // The exported /api/resume file has no extension.
  const type = MIME[extname(file)] ?? (path === "/api/resume" ? MIME[".json"] : "application/octet-stream");
  const immutable = path.startsWith("/_next/static/");
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
  });
  createReadStream(file).pipe(res);
}

createServer(async (req, res) => {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;
  try {
    if (path.startsWith("/api/") && (await handleApi(req, res, path))) {
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      throw new HttpError(405, "Method not allowed");
    }
    serveStatic(res, path);
  } catch (error) {
    if (error instanceof HttpError) {
      send(res, error.status, { error: error.message });
    } else {
      console.error(error);
      send(res, 500, { error: "Internal error" });
    }
  }
}).listen(port, host, () => {
  console.log(`Job hunt workspace on http://${host}:${port}`);
});
