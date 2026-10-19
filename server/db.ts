import { createHash } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seedCards } from "./learn-seed.ts";
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

// Applied once each, in order, after the base schema. Never edit a shipped entry; add a new one.
const migrations: [string, string][] = [
  [
    "001-contacts",
    `
    ALTER TABLE companies ADD COLUMN linkedin_url TEXT NOT NULL DEFAULT '';
    ALTER TABLE companies ADD COLUMN website TEXT NOT NULL DEFAULT '';
    ALTER TABLE companies ADD COLUMN industry TEXT NOT NULL DEFAULT '';
    ALTER TABLE companies ADD COLUMN size TEXT NOT NULL DEFAULT '';
    ALTER TABLE companies ADD COLUMN notes TEXT NOT NULL DEFAULT '';

    CREATE TABLE contacts (
      id INTEGER PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      linkedin_url TEXT UNIQUE,
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    ALTER TABLE jobs ADD COLUMN location TEXT NOT NULL DEFAULT '';
    ALTER TABLE jobs ADD COLUMN work_type TEXT NOT NULL DEFAULT '';
    ALTER TABLE jobs ADD COLUMN employment_type TEXT NOT NULL DEFAULT '';
    ALTER TABLE jobs ADD COLUMN salary TEXT NOT NULL DEFAULT '';
    ALTER TABLE jobs ADD COLUMN posted_on TEXT NOT NULL DEFAULT '';
    ALTER TABLE jobs ADD COLUMN applicants TEXT NOT NULL DEFAULT '';
    ALTER TABLE jobs ADD COLUMN contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL;
    ALTER TABLE jobs ADD COLUMN scraped_at TEXT NOT NULL DEFAULT '';

    -- Every outreach or reply, so it's clear who has been contacted and when.
    CREATE TABLE contact_log (
      id INTEGER PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
      channel TEXT NOT NULL DEFAULT 'LinkedIn',
      direction TEXT NOT NULL DEFAULT 'out' CHECK (direction IN ('out', 'in')),
      happened_on TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      follow_up_on TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX contact_log_company ON contact_log(company_id, happened_on);
    `,
  ],
  [
    "002-active-roles",
    `
    -- Roles I'm actively job hunting for; job searches should target these.
    ALTER TABLE qualification_roles ADD COLUMN active INTEGER NOT NULL DEFAULT 0;
    `,
  ],
  [
    "003-learn-and-todos",
    `
    -- Study cards with SM-2 style spaced-repetition state. topic is a skill name or an
    -- interview topic (Behavioral, Soft skills, System design).
    CREATE TABLE learn_cards (
      id INTEGER PRIMARY KEY,
      topic TEXT NOT NULL COLLATE NOCASE,
      kind TEXT NOT NULL CHECK (kind IN ('flashcard', 'mcq', 'practice', 'soft')),
      prompt TEXT NOT NULL,
      answer TEXT NOT NULL DEFAULT '',
      choices TEXT NOT NULL DEFAULT '[]',
      correct INTEGER,
      explanation TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'seed',
      ease REAL NOT NULL DEFAULT 2.5,
      interval_days INTEGER NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL DEFAULT 0,
      lapses INTEGER NOT NULL DEFAULT 0,
      due_on TEXT NOT NULL DEFAULT '',
      last_reviewed TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX learn_cards_topic ON learn_cards(topic, due_on);

    CREATE TABLE learn_reviews (
      id INTEGER PRIMARY KEY,
      card_id INTEGER NOT NULL REFERENCES learn_cards(id) ON DELETE CASCADE,
      grade INTEGER NOT NULL CHECK (grade BETWEEN 0 AND 3),
      reviewed_on TEXT NOT NULL
    );

    CREATE TABLE todos (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      done INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      done_at TEXT NOT NULL DEFAULT ''
    );
    `,
  ],
  [
    "004-job-codes",
    `
    -- Short human-friendly handle for referring to a posting ("K7QM"). Filled by assignJobCodes.
    ALTER TABLE jobs ADD COLUMN code TEXT;
    CREATE UNIQUE INDEX jobs_code ON jobs(code);
    `,
  ],
];

// Codes are derived from a stable key so the same posting always gets the same code, matching
// the codes in the job-hunt JSON files (tools/add_codes.py). No 0/O or 1/I look-alikes.
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function makeJobCode(key: string, salt = 0) {
  const n = createHash("sha256").update(`${key}#${salt}`).digest().readBigUInt64BE(0);
  return Array.from({ length: 4 }, (_, i) => CODE_ALPHABET[Number((n >> BigInt(5 * i)) & BigInt(31))]).join("");
}

function stableJobKey(job: { external_id: string | null; source: string; company: string; title: string }) {
  const id = job.external_id ?? "";
  if (/^\d+$/.test(id)) return `linkedin:${id}`;
  if (id.startsWith("indeed:")) return id;
  return `x:${[job.source, "", job.company, job.title].map((part) => part.trim().toLowerCase()).join("|")}`;
}

// Gives every job without a code a unique 4-character code. Called on startup and after inserts,
// so any insert path gets one automatically.
export function assignJobCodes(db: DatabaseSync) {
  const missing = db
    .prepare(
      `SELECT j.id, j.external_id, j.source, c.name AS company, j.title
         FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.code IS NULL`,
    )
    .all() as { id: number; external_id: string | null; source: string; company: string; title: string }[];
  const taken = new Set(
    (db.prepare("SELECT code FROM jobs WHERE code IS NOT NULL").all() as { code: string }[]).map((row) => row.code),
  );
  const setCode = db.prepare("UPDATE jobs SET code = ? WHERE id = ?");
  for (const job of missing) {
    const key = stableJobKey(job);
    let salt = 0;
    let code = makeJobCode(key);
    while (taken.has(code)) {
      salt += 1;
      code = makeJobCode(key, salt);
    }
    taken.add(code);
    setCode.run(code, job.id);
  }
  return missing.length;
}

function migrate(db: DatabaseSync) {
  for (const [key, sql] of migrations) {
    if (!seeded(db, `migration.${key}`)) {
      db.exec(sql);
      markSeeded(db, `migration.${key}`);
    }
  }
}

export function openDb() {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(schema);
  db.exec("BEGIN");
  try {
    migrate(db);
    seed(db);
    assignJobCodes(db);
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

  if (!seeded(db, "seed.learn-cards")) {
    const insert = db.prepare(
      `INSERT INTO learn_cards (topic, kind, prompt, answer, choices, correct, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const card of seedCards) {
      if (card.kind === "mcq") {
        insert.run(card.topic, card.kind, card.prompt, "", JSON.stringify(card.choices), card.correct, card.explanation);
      } else {
        insert.run(card.topic, card.kind, card.prompt, card.answer, "[]", null, "");
      }
    }
    markSeeded(db, "seed.learn-cards");
  }

  if (!seeded(db, "seed.todos")) {
    db.prepare("INSERT INTO todos (title, notes, position) VALUES (?, ?, 0)").run(
      "Code review",
      "Review the job-hunt workspace code (server/ and src/) before pushing to GitHub.",
    );
    markSeeded(db, "seed.todos");
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
