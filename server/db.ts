import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { knownSkills, leads } from "./seed-data.ts";

const root = join(import.meta.dirname, "..");
export const dbPath = process.env.TRACKER_DB ?? join(root, "data", "tracker.db");

const schema = `
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE
);

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  status TEXT NOT NULL DEFAULT 'want' CHECK (status IN ('know', 'learning', 'want'))
);

-- A job posting, independent of whether I apply.
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT UNIQUE,
  details TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS job_skills (
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, skill_id)
);

-- My pipeline state for a job.
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY,
  job_id INTEGER NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Saved'
    CHECK (status IN ('Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn')),
  applied_on TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS qualification_roles (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  updated TEXT
);

-- Each distinct qualification text once, so hiding applies to every role that lists it.
CREATE TABLE IF NOT EXISTS qualification_lines (
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL UNIQUE COLLATE NOCASE,
  hidden INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS role_qualifications (
  role_id INTEGER NOT NULL REFERENCES qualification_roles(id) ON DELETE CASCADE,
  line_id INTEGER NOT NULL REFERENCES qualification_lines(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  PRIMARY KEY (role_id, line_id)
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

export function openDb() {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(schema);
  db.exec("BEGIN");
  try {
    seed(db);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return db;
}

export function upsertCompany(db: DatabaseSync, name: string) {
  db.prepare("INSERT INTO companies (name) VALUES (?) ON CONFLICT(name) DO NOTHING").run(name);
  return (db.prepare("SELECT id FROM companies WHERE name = ?").get(name) as { id: number }).id;
}

export function upsertSkill(db: DatabaseSync, name: string, status = "want") {
  db.prepare("INSERT INTO skills (name, status) VALUES (?, ?) ON CONFLICT(name) DO NOTHING").run(
    name,
    status,
  );
  return (db.prepare("SELECT id FROM skills WHERE name = ?").get(name) as { id: number }).id;
}

export function linkJobSkills(db: DatabaseSync, jobId: number, skills: string[]) {
  const link = db.prepare("INSERT OR IGNORE INTO job_skills (job_id, skill_id) VALUES (?, ?)");
  for (const name of skills) {
    link.run(jobId, upsertSkill(db, name));
  }
}

function seeded(db: DatabaseSync, key: string) {
  return db.prepare("SELECT 1 FROM meta WHERE key = ?").get(key) !== undefined;
}

function markSeeded(db: DatabaseSync, key: string) {
  db.prepare("INSERT INTO meta (key, value) VALUES (?, ?)").run(key, new Date().toISOString());
}

function seed(db: DatabaseSync) {
  if (!seeded(db, "seed.skills")) {
    for (const name of knownSkills) {
      upsertSkill(db, name, "know");
    }
    markSeeded(db, "seed.skills");
  }

  if (!seeded(db, "seed.linkedin-2026-10-19")) {
    const insertJob = db.prepare(
      `INSERT INTO jobs (company_id, title, url, source, external_id, details, created_at)
       VALUES (?, ?, ?, 'linkedin', ?, ?, '2026-10-19T00:00:00.000Z') RETURNING id`,
    );
    for (const lead of leads) {
      const { id } = insertJob.get(
        upsertCompany(db, lead.company),
        lead.title,
        `https://www.linkedin.com/jobs/view/${lead.externalId}/`,
        lead.externalId,
        lead.details,
      ) as { id: number };
      linkJobSkills(db, id, lead.skills);
      db.prepare("INSERT INTO applications (job_id) VALUES (?)").run(id);
    }
    markSeeded(db, "seed.linkedin-2026-10-19");
  }

  if (!seeded(db, "seed.qualifications")) {
    const data = JSON.parse(readFileSync(join(root, "data", "qualifications.json"), "utf8")) as {
      source: string;
      note: string;
      jobs: { title: string; qualifications: string[]; last_updated_raw: string | null }[];
    };
    const insertRole = db.prepare(
      "INSERT INTO qualification_roles (title, updated) VALUES (?, ?) RETURNING id",
    );
    const upsertLine = db.prepare(
      "INSERT INTO qualification_lines (text) VALUES (?) ON CONFLICT(text) DO UPDATE SET text = text RETURNING id",
    );
    const link = db.prepare(
      "INSERT OR IGNORE INTO role_qualifications (role_id, line_id, position) VALUES (?, ?, ?)",
    );
    for (const job of data.jobs) {
      const { id: roleId } = insertRole.get(job.title.split("\n")[0].trim(), job.last_updated_raw) as {
        id: number;
      };
      job.qualifications.forEach((text, position) => {
        const { id: lineId } = upsertLine.get(text.trim()) as { id: number };
        link.run(roleId, lineId, position);
      });
    }
    db.prepare("INSERT INTO meta (key, value) VALUES ('qualifications.source', ?), ('qualifications.note', ?)").run(
      data.source,
      data.note,
    );
    markSeeded(db, "seed.qualifications");
  }
}
