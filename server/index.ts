// Local server for the job-hunt workspace: serves the static export in out/ and a small
// SQLite-backed JSON API under /api. Run with `npm run serve` after `npm run build`.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize } from "node:path";
import { linkJobSkills, openDb, upsertCompany } from "./db.ts";
import { detectSkills } from "./skill-detect.ts";

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
      `SELECT a.id, a.job_id AS jobId, j.title AS role, c.id AS companyId, c.name AS company,
              c.linkedin_url AS companyLinkedin, j.url, j.source, j.details, j.location,
              j.work_type AS workType, j.employment_type AS employmentType, j.salary,
              j.posted_on AS postedOn, j.applicants, j.description AS jobDescription,
              j.created_at AS createdAt, a.status, a.applied_on AS appliedOn, a.notes,
              ct.id AS contactId, ct.name AS contactName, ct.title AS contactTitle,
              ct.linkedin_url AS contactLinkedin, ct.email AS contactEmail, ct.phone AS contactPhone,
              (SELECT MAX(happened_on) FROM contact_log l WHERE l.company_id = c.id) AS lastContactedOn
         FROM applications a
         JOIN jobs j ON j.id = a.job_id
         JOIN companies c ON c.id = j.company_id
         LEFT JOIN contacts ct ON ct.id = j.contact_id
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

function listCompanies() {
  const companies = db
    .prepare(
      `SELECT c.id, c.name, c.linkedin_url AS linkedinUrl, c.website, c.industry, c.size, c.notes,
              (SELECT COUNT(*) FROM jobs j WHERE j.company_id = c.id) AS jobCount,
              (SELECT GROUP_CONCAT(DISTINCT j.source) FROM jobs j WHERE j.company_id = c.id) AS sources,
              (SELECT COUNT(*) FROM applications a JOIN jobs j ON j.id = a.job_id
                WHERE j.company_id = c.id AND a.status NOT IN ('Saved')) AS appliedCount,
              (SELECT MAX(happened_on) FROM contact_log l WHERE l.company_id = c.id) AS lastContactedOn
         FROM companies c
        ORDER BY lastContactedOn IS NULL, lastContactedOn DESC, c.name`,
    )
    .all() as Record<string, unknown>[];
  const contacts = db
    .prepare(
      `SELECT id, company_id AS companyId, name, title, linkedin_url AS linkedinUrl, email, phone, notes
         FROM contacts ORDER BY name`,
    )
    .all() as { companyId: number }[];
  const jobs = db
    .prepare(
      `SELECT j.id, j.company_id AS companyId, j.title, j.url, a.id AS applicationId, a.status
         FROM jobs j LEFT JOIN applications a ON a.job_id = j.id ORDER BY j.created_at DESC`,
    )
    .all() as { companyId: number }[];
  const log = listContactLog() as { companyId: number }[];
  return companies.map((company) => ({
    ...company,
    sources: company.sources ? String(company.sources).split(",") : [],
    contacts: contacts.filter((contact) => contact.companyId === company.id),
    jobs: jobs.filter((job) => job.companyId === company.id),
    log: log.filter((entry) => entry.companyId === company.id),
  }));
}

function listContactLog(limit = 1000) {
  return db
    .prepare(
      `SELECT l.id, l.company_id AS companyId, c.name AS company, l.contact_id AS contactId,
              ct.name AS contactName, l.job_id AS jobId, j.title AS jobTitle, l.channel, l.direction,
              l.happened_on AS happenedOn, l.summary, l.follow_up_on AS followUpOn
         FROM contact_log l
         JOIN companies c ON c.id = l.company_id
         LEFT JOIN contacts ct ON ct.id = l.contact_id
         LEFT JOIN jobs j ON j.id = l.job_id
        ORDER BY l.happened_on DESC, l.id DESC
        LIMIT ?`,
    )
    .all(limit);
}

function dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const count = (sql: string, ...params: string[]) =>
    (db.prepare(sql).get(...params) as { n: number }).n;
  const pipeline = db
    .prepare("SELECT status, COUNT(*) AS n FROM applications GROUP BY status")
    .all() as { status: string; n: number }[];
  return {
    totals: {
      jobs: count("SELECT COUNT(*) AS n FROM jobs"),
      companies: count("SELECT COUNT(*) AS n FROM companies"),
      contacts: count("SELECT COUNT(*) AS n FROM contacts"),
      contactedThisWeek: count(
        "SELECT COUNT(DISTINCT company_id) AS n FROM contact_log WHERE direction = 'out' AND happened_on >= ?",
        weekAgo,
      ),
      neverContacted: count(
        "SELECT COUNT(*) AS n FROM companies c WHERE NOT EXISTS (SELECT 1 FROM contact_log l WHERE l.company_id = c.id)",
      ),
    },
    pipeline: STATUSES.map((status) => ({
      status,
      count: pipeline.find((row) => row.status === status)?.n ?? 0,
    })),
    sources: db
      .prepare("SELECT source, COUNT(*) AS count FROM jobs GROUP BY source ORDER BY count DESC")
      .all(),
    // Follow-ups: dates set on a log entry, or applied 7+ days ago with nothing logged since.
    followUps: db
      .prepare(
        `SELECT 'log' AS kind, l.company_id AS companyId, c.name AS company, ct.name AS contactName,
                l.follow_up_on AS due, l.summary AS reason
           FROM contact_log l JOIN companies c ON c.id = l.company_id
           LEFT JOIN contacts ct ON ct.id = l.contact_id
          WHERE l.follow_up_on != '' AND l.follow_up_on <= ?
            AND NOT EXISTS (SELECT 1 FROM contact_log n WHERE n.company_id = l.company_id AND n.happened_on > l.happened_on)
         UNION ALL
         SELECT 'applied', c.id, c.name, NULL, a.applied_on, 'Applied to ' || j.title
           FROM applications a JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
          WHERE a.status = 'Applied' AND a.applied_on != '' AND a.applied_on <= ?
            AND NOT EXISTS (SELECT 1 FROM contact_log n WHERE n.company_id = c.id AND n.happened_on > a.applied_on)
          ORDER BY due`,
      )
      .all(today, weekAgo),
    topGaps: db
      .prepare(
        `SELECT s.name, COUNT(js.job_id) AS demand
           FROM skills s JOIN job_skills js ON js.skill_id = s.id
          WHERE s.status != 'know' GROUP BY s.id ORDER BY demand DESC, s.name LIMIT 6`,
      )
      .all(),
    recent: listContactLog(8),
  };
}

// Upserts a scraped posting: company, hiring contact, job fields and detected skills.
function importJob(body: Record<string, unknown>) {
  const source = text(body, "source", true)!;
  const externalId = text(body, "externalId", true)!;
  const companyId = upsertCompany(db, text(body, "company", true)!);
  db.prepare(
    `UPDATE companies SET
       linkedin_url = COALESCE(NULLIF(?, ''), linkedin_url),
       industry = COALESCE(NULLIF(?, ''), industry),
       size = COALESCE(NULLIF(?, ''), size)
     WHERE id = ?`,
  ).run(text(body, "companyLinkedin") ?? "", text(body, "industry") ?? "", text(body, "size") ?? "", companyId);

  let contactId: number | null = null;
  const contact = body.contact as Record<string, unknown> | undefined;
  if (contact && typeof contact.name === "string" && contact.name.trim()) {
    const url = text(contact, "linkedinUrl") || null;
    const existing = url
      ? (db.prepare("SELECT id FROM contacts WHERE linkedin_url = ?").get(url) as { id: number } | undefined)
      : (db.prepare("SELECT id FROM contacts WHERE name = ? AND company_id = ?").get(contact.name.trim(), companyId) as
          | { id: number }
          | undefined);
    contactId =
      existing?.id ??
      (
        db
          .prepare("INSERT INTO contacts (company_id, name, linkedin_url) VALUES (?, ?, ?) RETURNING id")
          .get(companyId, contact.name.trim(), url) as { id: number }
      ).id;
    db.prepare(
      `UPDATE contacts SET
         title = COALESCE(NULLIF(?, ''), title),
         email = COALESCE(NULLIF(?, ''), email),
         phone = COALESCE(NULLIF(?, ''), phone)
       WHERE id = ?`,
    ).run(text(contact, "title") ?? "", text(contact, "email") ?? "", text(contact, "phone") ?? "", contactId);
  }

  const description = text(body, "description") ?? "";
  const fields = [
    companyId,
    // LinkedIn sometimes appends a requisition number: "Senior Web Developer - 65730485173".
    text(body, "title", true)!.replace(/\s+-\s+\d{6,}$/, ""),
    text(body, "url") ?? "",
    description,
    text(body, "location") ?? "",
    text(body, "workType") ?? "",
    text(body, "employmentType") ?? "",
    text(body, "salary") ?? "",
    text(body, "postedOn") ?? "",
    text(body, "applicants") ?? "",
    contactId,
    new Date().toISOString(),
  ];
  const existing = db
    .prepare("SELECT id FROM jobs WHERE external_id = ?")
    .get(externalId) as { id: number } | undefined;
  let jobId: number;
  if (existing) {
    jobId = existing.id;
    db.prepare(
      `UPDATE jobs SET company_id = ?, title = ?, url = COALESCE(NULLIF(?, ''), url), description = ?,
         location = ?, work_type = ?, employment_type = ?, salary = ?, posted_on = ?, applicants = ?,
         contact_id = COALESCE(?, contact_id), scraped_at = ?
       WHERE id = ?`,
    ).run(...(fields as (string | number | null)[]), jobId);
  } else {
    jobId = (
      db
        .prepare(
          `INSERT INTO jobs (company_id, title, url, description, location, work_type, employment_type,
             salary, posted_on, applicants, contact_id, scraped_at, source, external_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        )
        .get(...(fields as (string | number | null)[]), source, externalId) as { id: number }
    ).id;
    db.prepare("INSERT INTO applications (job_id) VALUES (?)").run(jobId);
  }
  linkJobSkills(db, jobId, detectSkills(description));
  return { jobId, companyId, contactId, created: !existing };
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

  if (resource === "companies") {
    if (method === "GET" && id === undefined) {
      send(res, 200, listCompanies());
    } else if (method === "PATCH" && id !== undefined) {
      const body = await readJson(req);
      update("companies", id, {
        linkedin_url: text(body, "linkedinUrl"),
        website: text(body, "website"),
        industry: text(body, "industry"),
        size: text(body, "size"),
        notes: text(body, "notes"),
      });
      send(res, 200, listCompanies());
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    return true;
  }

  if (resource === "contacts") {
    const body = method === "POST" || method === "PATCH" ? await readJson(req) : {};
    const fields = {
      name: text(body, "name", method === "POST"),
      title: text(body, "title"),
      linkedin_url: text(body, "linkedinUrl"),
      email: text(body, "email"),
      phone: text(body, "phone"),
      notes: text(body, "notes"),
    };
    if (method === "POST" && id === undefined) {
      if (typeof body.companyId !== "number") {
        throw new HttpError(400, "companyId must be a number");
      }
      db.prepare(
        `INSERT INTO contacts (company_id, name, title, linkedin_url, email, phone, notes)
         VALUES (?, ?, ?, NULLIF(?, ''), ?, ?, ?)`,
      ).run(
        body.companyId,
        fields.name!,
        fields.title ?? "",
        fields.linkedin_url ?? "",
        fields.email ?? "",
        fields.phone ?? "",
        fields.notes ?? "",
      );
    } else if (method === "PATCH" && id !== undefined) {
      update("contacts", id, fields);
    } else if (method === "DELETE" && id !== undefined) {
      db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    send(res, method === "POST" ? 201 : 200, listCompanies());
    return true;
  }

  if (resource === "contact-log") {
    if (method === "GET" && id === undefined) {
      send(res, 200, listContactLog());
      return true;
    }
    if (method === "POST" && id === undefined) {
      const body = await readJson(req);
      if (typeof body.companyId !== "number") {
        throw new HttpError(400, "companyId must be a number");
      }
      const optionalId = (key: string) => (typeof body[key] === "number" ? (body[key] as number) : null);
      db.prepare(
        `INSERT INTO contact_log (company_id, contact_id, job_id, channel, direction, happened_on, summary, follow_up_on)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        body.companyId,
        optionalId("contactId"),
        optionalId("jobId"),
        text(body, "channel") || "LinkedIn",
        oneOf(text(body, "direction"), ["out", "in"], "direction") ?? "out",
        text(body, "happenedOn") || new Date().toISOString().slice(0, 10),
        text(body, "summary") ?? "",
        text(body, "followUpOn") ?? "",
      );
    } else if (method === "DELETE" && id !== undefined) {
      db.prepare("DELETE FROM contact_log WHERE id = ?").run(id);
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    send(res, method === "POST" ? 201 : 200, listCompanies());
    return true;
  }

  if (resource === "dashboard" && method === "GET" && id === undefined) {
    send(res, 200, dashboard());
    return true;
  }

  // Scraped postings: { jobs: [...] }. Accepts text/plain so a browser page can post it.
  if (resource === "import" && method === "POST" && id === undefined) {
    const body = await readJson(req);
    if (!Array.isArray(body.jobs)) {
      throw new HttpError(400, "jobs must be an array");
    }
    db.exec("BEGIN");
    try {
      const results = (body.jobs as Record<string, unknown>[]).map(importJob);
      db.exec("COMMIT");
      send(res, 200, results);
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
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
