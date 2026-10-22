// Local server for the job-hunt workspace: serves the static export in out/ and a small
// SQLite-backed JSON API under /api. Run with `npm run serve` after `npm run build`.
import { createHash } from "node:crypto";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize } from "node:path";
import { assignJobCodes, backfillPay, linkJobSkills, openDb, recountSkills, upsertCompany } from "./db.ts";
import { AREAS, listImprovements, scanImprovements } from "./improvements.ts";
import { studyLinks } from "./learn-links.ts";
import { classifyLines } from "./role-lines.ts";
import { detectSkills } from "./skill-detect.ts";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4173);
const outDir = join(import.meta.dirname, "..", "out");
const db = openDb();

const COMPANY_KINDS = ["employer", "agency", "confidential", "unknown"];
const STATUSES = ["Saved", "Applied", "Interviewing", "Offer", "Rejected", "Withdrawn"];
const SKILL_STATUSES = ["know", "learning", "want"];

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Validates the Supabase access token the workspace sends. Without Supabase config it fails
// closed; set ALLOW_NO_AUTH=1 to run the API unauthenticated on purpose.
async function requireUser(req: IncomingMessage) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    if (process.env.ALLOW_NO_AUTH === "1") {
      return;
    }
    throw new HttpError(503, "Auth is not configured: set the Supabase env vars or ALLOW_NO_AUTH=1");
  }
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  const response = token
    ? await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } })
    : null;
  if (!response?.ok) {
    throw new HttpError(401, "Sign in required");
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
      `SELECT a.id, a.job_id AS jobId, j.code, j.title AS role, c.id AS companyId, c.name AS company,
              c.linkedin_url AS companyLinkedin, j.url, j.source, j.details, j.location,
              j.work_type AS workType, j.employment_type AS employmentType, j.salary,
              j.pay_min_php AS payMin, j.pay_max_php AS payMax, j.pay_hourly AS payHourly,
              j.posted_on AS postedOn, j.applicants, j.description AS jobDescription,
              j.created_at AS createdAt, a.status, a.applied_on AS appliedOn, a.notes,
              c.kind AS companyKind, c.website AS companyWebsite, c.careers_url AS companyCareers, c.brief AS companyBrief,
              (j.priority = 1 OR c.priority = 1) AS priority, c.priority AS companyPriority,
              j.client_note AS clientNote,
              (SELECT MAX(happened_on) FROM contact_log l WHERE l.company_id = c.id) AS lastContactedOn
         FROM applications a
         JOIN jobs j ON j.id = a.job_id
         JOIN companies c ON c.id = j.company_id
        ORDER BY j.created_at DESC, a.id ASC`,
    )
    .all() as Record<string, unknown>[];
  const contactRows = db
    .prepare(
      `SELECT jc.job_id AS jobId, jc.role, ct.id, ct.name, ct.title, ct.linkedin_url AS linkedinUrl,
              ct.email, ct.phone
         FROM job_contacts jc JOIN contacts ct ON ct.id = jc.contact_id ORDER BY ct.name`,
    )
    .all() as { jobId: number }[];
  const companyContactRows = db
    .prepare(
      `SELECT id, company_id AS companyId, name, title, linkedin_url AS linkedinUrl, email, phone
         FROM contacts WHERE company_id IS NOT NULL ORDER BY name`,
    )
    .all() as { companyId: number }[];
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
      priority: row.priority === 1,
      companyPriority: row.companyPriority === 1,
      contacts: contactRows.filter((contact) => contact.jobId === row.jobId),
      companyContacts: companyContactRows.filter((contact) => contact.companyId === row.companyId),
      skills,
      matchPercent: skills.length > 0 ? Math.round((known / skills.length) * 100) : null,
    };
  });
}

// Skills you do not know yet, ranked by how many job posts mention them, with a path if one exists.
function listRecommendations() {
  const skills = db
    .prepare(
      `SELECT s.id, s.name, s.status, COUNT(js.job_id) AS demand
         FROM skills s JOIN job_skills js ON js.skill_id = s.id
        WHERE s.status != 'know' GROUP BY s.id ORDER BY demand DESC, s.name LIMIT 12`,
    )
    .all() as { id: number; name: string; status: string; demand: number }[];
  const totals = db
    .prepare(
      "SELECT COUNT(*) AS jobs, SUM(EXISTS (SELECT 1 FROM job_skills WHERE job_id = jobs.id)) AS withSkills FROM jobs",
    )
    .get() as { jobs: number; withSkills: number };
  const paths = db.prepare("SELECT id, skill FROM learning_paths").all() as { id: number; skill: string }[];
  const examples = db.prepare(
    `SELECT j.code, j.title, c.name AS company
       FROM job_skills js JOIN jobs j ON j.id = js.job_id JOIN companies c ON c.id = j.company_id
      WHERE js.skill_id = ? ORDER BY j.priority DESC, j.id DESC LIMIT 3`,
  );
  return {
    totalJobs: totals.jobs,
    jobsWithSkills: totals.withSkills ?? 0,
    skills: skills.map((skill) => ({
      ...skill,
      pathId: paths.find((path) => path.skill.toLowerCase() === skill.name.toLowerCase())?.id ?? null,
      examples: examples.all(skill.id),
    })),
  };
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

// Roles from the qualifications sheet, split into degree, tech skill pills and soft skills.
function listRoles() {
  const meta = Object.fromEntries(
    (db.prepare("SELECT key, value FROM meta WHERE key LIKE 'qualifications.%'").all() as {
      key: string;
      value: string;
    }[]).map(({ key, value }) => [key.replace("qualifications.", ""), value]),
  );
  const roles = db
    .prepare("SELECT id, title, updated, active FROM qualification_roles ORDER BY id")
    .all() as { id: number; title: string; updated: string | null; active: number }[];
  const lines = db
    .prepare(
      `SELECT rq.role_id AS roleId, l.text
         FROM role_qualifications rq JOIN qualification_lines l ON l.id = rq.line_id
        ORDER BY rq.role_id, rq.position`,
    )
    .all() as { roleId: number; text: string }[];
  const known = new Set(
    (db.prepare("SELECT name FROM skills WHERE status = 'know'").all() as { name: string }[]).map(
      ({ name }) => name.toLowerCase(),
    ),
  );
  return {
    source: meta.source ?? "",
    note: meta.note ?? "",
    roles: roles.map((role) => {
      const view = classifyLines(lines.filter((line) => line.roleId === role.id).map((line) => line.text));
      return {
        ...role,
        active: role.active === 1,
        ...view,
        skills: view.skills.map((skill) => ({ ...skill, known: known.has(skill.name.toLowerCase()) })),
      };
    }),
  };
}

function listCompanies() {
  const companies = db
    .prepare(
      `SELECT c.id, c.name, c.legal_name AS legalName, c.kind, c.linkedin_url AS linkedinUrl, c.website,
              c.careers_url AS careersUrl, c.industry, c.size, c.notes, c.enriched_on AS enrichedOn,
              c.priority, c.priority_note AS priorityNote, c.brief,
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
      `SELECT j.id, j.code, j.priority, j.company_id AS companyId, j.title, j.url, j.client_note AS clientNote,
              a.id AS applicationId, a.status
         FROM jobs j LEFT JOIN applications a ON a.job_id = j.id ORDER BY j.created_at DESC`,
    )
    .all() as { id: number; companyId: number }[];
  const jobContacts = db.prepare("SELECT job_id AS jobId, contact_id AS contactId FROM job_contacts").all() as {
    jobId: number;
    contactId: number;
  }[];
  const log = listContactLog() as { companyId: number }[];
  return companies.map((company) => ({
    ...company,
    priority: company.priority === 1,
    sources: company.sources ? String(company.sources).split(",") : [],
    contacts: contacts.filter((contact) => contact.companyId === company.id),
    jobs: jobs
      .filter((job) => job.companyId === company.id)
      .map((job) => ({
        ...job,
        priority: (job as unknown as { priority: number }).priority === 1,
        contactIds: jobContacts.filter((link) => link.jobId === job.id).map((link) => link.contactId),
      })),
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
    funnel: funnel(),
    draftsToSend: (db.prepare("SELECT COUNT(*) AS n FROM outreach WHERE status = 'draft'").get() as { n: number }).n,
    activeRoles: db
      .prepare("SELECT id, title FROM qualification_roles WHERE active = 1 ORDER BY title")
      .all(),
  };
}

const INTERVIEW_TOPICS = ["Behavioral", "Soft skills", "System design"];
const CARD_KINDS = ["flashcard", "mcq", "practice", "soft"];
const localDay = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 864e5).toLocaleDateString("en-CA");

// Topics in study scope: skills marked I know / Learning, plus the interview topics.
function learnScopeSql() {
  return `(lower(c.topic) IN (SELECT lower(name) FROM skills WHERE status IN ('know', 'learning'))
           OR c.topic IN (${INTERVIEW_TOPICS.map(() => "?").join(", ")}))`;
}

function learnOverview() {
  const today = localDay();
  const skills = db
    .prepare("SELECT name, status FROM skills WHERE status IN ('know', 'learning') ORDER BY status DESC, name")
    .all() as { name: string; status: string }[];
  const counts = db
    .prepare(
      `SELECT lower(topic) AS topic, COUNT(*) AS cards,
              SUM(CASE WHEN reps = 0 AND lapses = 0 THEN 1 ELSE 0 END) AS fresh,
              SUM(CASE WHEN due_on != '' AND due_on <= ? THEN 1 ELSE 0 END) AS due
         FROM learn_cards GROUP BY lower(topic)`,
    )
    .all(today) as { topic: string; cards: number; fresh: number; due: number }[];
  const byTopic = new Map(counts.map((row) => [row.topic, row]));
  const topic = (name: string, status: string) => {
    const row = byTopic.get(name.toLowerCase());
    return { name, status, cards: row?.cards ?? 0, fresh: row?.fresh ?? 0, due: row?.due ?? 0, links: studyLinks(name) };
  };
  const reviewedToday = (db.prepare("SELECT COUNT(*) AS n FROM learn_reviews WHERE reviewed_on = ?").get(today) as { n: number }).n;
  const days = (db.prepare("SELECT DISTINCT reviewed_on AS d FROM learn_reviews ORDER BY d DESC LIMIT 400").all() as { d: string }[]).map((r) => r.d);
  let streak = 0;
  for (let offset = days[0] === today ? 0 : 1; days.includes(localDay(-offset)); offset += 1) {
    streak += 1;
  }
  const topics = [
    ...INTERVIEW_TOPICS.map((name) => topic(name, "interview")),
    ...skills.map((skill) => topic(skill.name, skill.status)),
  ];
  const digest = db.prepare("SELECT value FROM meta WHERE key = 'learn.digest'").get() as { value: string } | undefined;
  return {
    digest: digest ? JSON.parse(digest.value) : null,
    topics,
    stats: {
      due: topics.reduce((sum, t) => sum + t.due, 0),
      fresh: topics.reduce((sum, t) => sum + t.fresh, 0),
      cards: topics.reduce((sum, t) => sum + t.cards, 0),
      reviewedToday,
      streak,
    },
  };
}

type CardRow = Record<string, unknown> & { choices: string };

// Due cards first, then new ones, shuffled so kinds and topics mix.
function learnDeck(topic: string | null, limit: number) {
  const today = localDay();
  const scope = topic ? "lower(c.topic) = lower(?)" : learnScopeSql();
  const params = topic ? [topic] : INTERVIEW_TOPICS;
  const select = `SELECT c.id, c.topic, c.kind, c.prompt, c.answer, c.choices, c.correct, c.explanation,
                         c.script, c.reps, c.interval_days AS intervalDays, c.due_on AS dueOn,
                         (SELECT feedback FROM learn_answers a WHERE a.card_id = c.id AND a.feedback != ''
                           ORDER BY a.id DESC LIMIT 1) AS feedback
                    FROM learn_cards c`;
  const due = db
    .prepare(`${select} WHERE ${scope} AND c.due_on != '' AND c.due_on <= ? ORDER BY c.due_on LIMIT ?`)
    .all(...params, today, limit) as CardRow[];
  const fresh = db
    .prepare(`${select} WHERE ${scope} AND c.reps = 0 AND c.lapses = 0 AND c.due_on = '' ORDER BY random() LIMIT ?`)
    .all(...params, Math.max(0, limit - due.length)) as CardRow[];
  const cards = [...due, ...fresh].map((card) => ({ ...card, choices: JSON.parse(card.choices), links: studyLinks(String(card.topic)) }));
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

// SM-2 style scheduling. grade: 0 again, 1 hard, 2 good, 3 easy.
function reviewCard(id: number, grade: number) {
  const card = db.prepare("SELECT ease, interval_days AS interval, reps, lapses FROM learn_cards WHERE id = ?").get(id) as
    | { ease: number; interval: number; reps: number; lapses: number }
    | undefined;
  if (!card) {
    throw new HttpError(404, "Card not found");
  }
  let { ease, interval, reps, lapses } = card;
  if (grade === 0) {
    reps = 0;
    lapses += 1;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    if (reps === 1) interval = grade === 3 ? 3 : 1;
    else if (reps === 2) interval = grade === 1 ? 3 : grade === 3 ? 6 : 4;
    else interval = Math.max(interval + 1, Math.round(interval * ease * (grade === 1 ? 0.8 : grade === 3 ? 1.3 : 1)));
    ease = Math.max(1.3, ease + (grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0));
  }
  const today = localDay();
  db.prepare(
    `UPDATE learn_cards SET ease = ?, interval_days = ?, reps = ?, lapses = ?, due_on = ?, last_reviewed = ? WHERE id = ?`,
  ).run(ease, interval, reps, lapses, localDay(interval), today, id);
  db.prepare("INSERT INTO learn_reviews (card_id, grade, reviewed_on) VALUES (?, ?, ?)").run(id, grade, today);
  return { id, intervalDays: interval, dueOn: localDay(interval) };
}

// Every card with a read-aloud script, for rehearsing before an interview.
function learnGuides() {
  return db
    .prepare(
      `SELECT c.id, c.topic, c.kind, c.prompt, c.script,
              (SELECT feedback FROM learn_answers a WHERE a.card_id = c.id AND a.feedback != ''
                ORDER BY a.id DESC LIMIT 1) AS feedback
         FROM learn_cards c WHERE c.script != ''
        ORDER BY CASE c.topic WHEN 'Behavioral' THEN 0 WHEN 'Soft skills' THEN 1 WHEN 'System design' THEN 2 ELSE 3 END, c.topic, c.id`,
    )
    .all();
}

function listTodos() {
  return db
    .prepare(
      `SELECT id, title, notes, done, created_at AS createdAt, done_at AS doneAt
         FROM todos ORDER BY done, position, id`,
    )
    .all()
    .map((row) => ({ ...(row as Record<string, unknown>), done: (row as { done: number }).done === 1 }));
}

function listPaths() {
  const paths = db
    .prepare("SELECT id, title, goal, skill, created_at AS createdAt FROM learning_paths ORDER BY id")
    .all() as Record<string, unknown>[];
  const steps = db
    .prepare(
      `SELECT id, path_id AS pathId, title, notes, url, position, status, done_at AS doneAt
         FROM learning_steps ORDER BY position, id`,
    )
    .all() as { pathId: number }[];
  return paths.map((path) => ({ ...path, steps: steps.filter((step) => step.pathId === path.id) }));
}

function listPreferences() {
  return db.prepare("SELECT id, kind, text, source, created_at AS createdAt FROM preferences ORDER BY id").all();
}

function listLibrary() {
  return db
    .prepare(
      `SELECT id, kind, title, body, file_name AS fileName, mime, size, created_at AS createdAt
         FROM library_items ORDER BY id DESC`,
    )
    .all();
}

const OUTREACH_STATUSES = ["draft", "sent", "replied", "dropped"];
const INTERVIEW_OUTCOMES = ["pending", "passed", "rejected", "withdrew"];
const OFFER_DECISIONS = ["open", "accepted", "declined"];

function listOutreach() {
  return db
    .prepare(
      `SELECT o.id, o.company_id AS companyId, c.name AS company, o.job_id AS jobId, j.code, j.title AS jobTitle,
              o.contact_id AS contactId, ct.name AS contactName, ct.title AS contactTitle,
              ct.linkedin_url AS contactLinkedin, ct.email AS contactEmail,
              o.channel, o.subject, o.body, o.status, o.created_on AS createdOn, o.sent_on AS sentOn,
              o.follow_up_on AS followUpOn, o.source
         FROM outreach o
         JOIN companies c ON c.id = o.company_id
         LEFT JOIN jobs j ON j.id = o.job_id
         LEFT JOIN contacts ct ON ct.id = o.contact_id
        ORDER BY CASE o.status WHEN 'draft' THEN 0 WHEN 'sent' THEN 1 WHEN 'replied' THEN 2 ELSE 3 END, o.id DESC`,
    )
    .all();
}

function listInterviews() {
  const interviews = db
    .prepare(
      `SELECT i.id, i.job_id AS jobId, j.code, j.title AS jobTitle, j.url, c.id AS companyId, c.name AS company,
              i.round, i.scheduled_on AS scheduledOn, i.with_whom AS withWhom, i.format, i.prep, i.notes, i.outcome
         FROM interviews i JOIN jobs j ON j.id = i.job_id JOIN companies c ON c.id = j.company_id
        ORDER BY i.scheduled_on = '', i.scheduled_on, i.id`,
    )
    .all();
  const offers = db
    .prepare(
      `SELECT f.id, f.job_id AS jobId, j.code, j.title AS jobTitle, c.name AS company, f.pay, f.schedule,
              f.benefits, f.growth, f.notes, f.decision, f.received_on AS receivedOn
         FROM offers f JOIN jobs j ON j.id = f.job_id JOIN companies c ON c.id = j.company_id
        ORDER BY f.decision != 'open', f.id DESC`,
    )
    .all();
  return { interviews, offers };
}

// Funnel for the Dashboard and the Monday summary. "Replied" = a company wrote back (contact log
// entry from them, or an outreach marked replied). "Direct" = Med reached out to a person, not
// just applied on a board.
function funnel() {
  const count = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  const stages = {
    saved: count("SELECT COUNT(*) AS n FROM applications"),
    applied: count("SELECT COUNT(*) AS n FROM applications WHERE status IN ('Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn') AND applied_on != ''"),
    replied: count(
      `SELECT COUNT(DISTINCT j.id) AS n FROM jobs j WHERE EXISTS (SELECT 1 FROM contact_log l WHERE l.direction = 'in' AND l.summary NOT LIKE '%confirmation%' AND l.summary NOT LIKE '%expired%' AND (l.job_id = j.id OR (l.job_id IS NULL AND l.company_id = j.company_id)))
          OR EXISTS (SELECT 1 FROM outreach o WHERE o.job_id = j.id AND o.status = 'replied')`,
    ),
    interviewing: count("SELECT COUNT(DISTINCT job_id) AS n FROM interviews"),
    offers: count("SELECT COUNT(*) AS n FROM offers"),
  };
  const bySource = db
    .prepare(
      `SELECT j.source, COUNT(*) AS saved,
              SUM(a.status IN ('Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn')) AS applied,
              SUM(EXISTS (SELECT 1 FROM contact_log l WHERE l.direction = 'in' AND l.summary NOT LIKE '%confirmation%' AND l.summary NOT LIKE '%expired%' AND l.company_id = j.company_id)) AS replied
         FROM jobs j JOIN applications a ON a.job_id = j.id GROUP BY j.source ORDER BY saved DESC`,
    )
    .all();
  const outreach = db
    .prepare(
      `SELECT SUM(status != 'draft' AND status != 'dropped') AS sent, SUM(status = 'replied') AS replied,
              SUM(status = 'draft') AS drafts FROM outreach`,
    )
    .get() as { sent: number | null; replied: number | null; drafts: number | null };
  return {
    stages,
    bySource,
    outreach: { sent: outreach.sent ?? 0, replied: outreach.replied ?? 0, drafts: outreach.drafts ?? 0 },
  };
}

// What to do this week: drafts waiting, follow-ups due, interviews coming up, new postings at
// priority companies. Used by the Dashboard and the Monday summary task.
function weekly() {
  const today = localDay();
  const weekAgo = localDay(-7);
  const weekAhead = localDay(7);
  return {
    today,
    draftsToSend: db
      .prepare(
        `SELECT o.id, c.name AS company, ct.name AS contactName, j.code, o.channel FROM outreach o
           JOIN companies c ON c.id = o.company_id LEFT JOIN contacts ct ON ct.id = o.contact_id
           LEFT JOIN jobs j ON j.id = o.job_id WHERE o.status = 'draft' ORDER BY o.id`,
      )
      .all(),
    followUps: dashboard().followUps,
    upcomingInterviews: db
      .prepare(
        `SELECT i.id, j.code, c.name AS company, j.title AS jobTitle, i.round, i.scheduled_on AS scheduledOn
           FROM interviews i JOIN jobs j ON j.id = i.job_id JOIN companies c ON c.id = j.company_id
          WHERE i.outcome = 'pending' AND i.scheduled_on != '' AND i.scheduled_on BETWEEN ? AND ? ORDER BY i.scheduled_on`,
      )
      .all(today, weekAhead),
    newAtPriority: db
      .prepare(
        `SELECT j.code, c.name AS company, j.title, j.url FROM jobs j JOIN companies c ON c.id = j.company_id
          WHERE (c.priority = 1 OR j.priority = 1) AND substr(j.created_at, 1, 10) >= ? ORDER BY j.created_at DESC`,
      )
      .all(weekAgo),
    funnel: funnel(),
  };
}

// Upserts a scraped posting: company, hiring contact, job fields and detected skills.
function importJob(body: Record<string, unknown>) {
  const source = text(body, "source", true)!;
  // Without an explicit id, derive a stable one from the posting URL, or from company + title.
  const jobUrl = text(body, "url") ?? "";
  const linkedinId = jobUrl.match(/linkedin\.com\/jobs\/view\/(\d+)/)?.[1];
  const indeedKey = jobUrl.match(/[?&]jk=([0-9a-f]{16})/)?.[1];
  const externalId =
    text(body, "externalId") ||
    linkedinId ||
    (indeedKey ? `indeed:${indeedKey}` : `x:${createHash("sha1").update(`${source}|${text(body, "company", true)}|${text(body, "title", true)}`.toLowerCase()).digest("hex").slice(0, 16)}`);
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
         contact_id = COALESCE(?, contact_id), scraped_at = ?, pay_min_php = NULL, pay_max_php = NULL, pay_hourly = 0
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
  if (contactId !== null) {
    db.prepare("INSERT OR IGNORE INTO job_contacts (job_id, contact_id) VALUES (?, ?)").run(jobId, contactId);
  }
  linkJobSkills(db, jobId, detectSkills(`${text(body, "title", true)}\n${description}`));
  // Keep a code the source file already assigned (so chat and app match) if it's free.
  const code = text(body, "code");
  if (code && /^[23456789A-HJ-NP-Z]{4}$/.test(code)) {
    db.prepare(
      "UPDATE jobs SET code = ? WHERE id = ? AND code IS NULL AND NOT EXISTS (SELECT 1 FROM jobs WHERE code = ?)",
    ).run(code, jobId, code);
  }
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

  // Mark a job (by its 4-character code) as priority or not: PATCH { code, priority }.
  if (resource === "job-priority" && method === "PATCH" && id === undefined) {
    const body = await readJson(req);
    if (typeof body.priority !== "boolean") {
      throw new HttpError(400, "priority must be a boolean");
    }
    const result = db.prepare("UPDATE jobs SET priority = ? WHERE code = ?").run(
      body.priority ? 1 : 0,
      text(body, "code", true)!.toUpperCase(),
    );
    if (result.changes === 0) {
      throw new HttpError(404, "No job with that code");
    }
    send(res, 200, listApplications());
    return true;
  }

  // Bulk research results: { companies: [{ name, website?, careersUrl?, linkedinUrl?, industry?, size?,
  // kind?, priority?, priorityNote?, contacts?: [{ name, title?, linkedinUrl?, email?, phone? }],
  // jobs?: [import-job fields] }] }. Matches existing companies by name; never overwrites filled fields.
  if (resource === "company-import" && method === "POST" && id === undefined) {
    const body = await readJson(req);
    if (!Array.isArray(body.companies)) {
      throw new HttpError(400, "companies must be an array");
    }
    const key = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const summary: Record<string, unknown>[] = [];
    db.exec("BEGIN");
    try {
      for (const entry of body.companies as Record<string, unknown>[]) {
        const name = text(entry, "name", true)!;
        const existing = (db.prepare("SELECT id, name FROM companies").all() as { id: number; name: string }[]).find(
          (row) => key(row.name) === key(name),
        );
        const companyId = existing?.id ?? upsertCompany(db, name);
        db.prepare(
          `UPDATE companies SET
             website = COALESCE(NULLIF(website, ''), ?),
             careers_url = COALESCE(NULLIF(careers_url, ''), ?),
             linkedin_url = COALESCE(NULLIF(linkedin_url, ''), ?),
             industry = COALESCE(NULLIF(industry, ''), ?),
             size = COALESCE(NULLIF(size, ''), ?),
             priority_note = COALESCE(NULLIF(?, ''), priority_note),
             enriched_on = ?
           WHERE id = ?`,
        ).run(
          text(entry, "website") ?? "",
          text(entry, "careersUrl") ?? "",
          text(entry, "linkedinUrl") ?? "",
          text(entry, "industry") ?? "",
          text(entry, "size") ?? "",
          text(entry, "priorityNote") ?? "",
          localDay(),
          companyId,
        );
        const kind = oneOf(text(entry, "kind"), COMPANY_KINDS, "kind");
        if (kind) db.prepare("UPDATE companies SET kind = ? WHERE id = ? AND kind = 'unknown'").run(kind, companyId);
        if (entry.priority === true) db.prepare("UPDATE companies SET priority = 1 WHERE id = ?").run(companyId);

        let contactsAdded = 0;
        for (const person of Array.isArray(entry.contacts) ? (entry.contacts as Record<string, unknown>[]) : []) {
          const personName = text(person, "name", true)!;
          const url = text(person, "linkedinUrl") || null;
          const dupe = url
            ? db.prepare("SELECT id FROM contacts WHERE linkedin_url = ?").get(url)
            : db.prepare("SELECT id FROM contacts WHERE company_id = ? AND lower(name) = lower(?)").get(companyId, personName);
          if (!dupe) {
            db.prepare(
              "INSERT INTO contacts (company_id, name, title, linkedin_url, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
            ).run(companyId, personName, text(person, "title") ?? "", url, text(person, "email") ?? "", text(person, "phone") ?? "");
            contactsAdded += 1;
          }
        }

        const jobResults: unknown[] = [];
        for (const job of Array.isArray(entry.jobs) ? (entry.jobs as Record<string, unknown>[]) : []) {
          const result = importJob({ source: "research", ...job, company: existing?.name ?? name });
          if (job.priority === true) db.prepare("UPDATE jobs SET priority = 1 WHERE id = ?").run(result.jobId);
          jobResults.push(result);
        }
        summary.push({ companyId, name, created: !existing, contactsAdded, jobs: jobResults.length });
      }
      assignJobCodes(db);
      backfillPay(db);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    send(res, 200, summary);
    return true;
  }

  // Set the direct posting link for a job by its 4-character code (e.g. replacing a Gmail link).
  if (resource === "job-links" && method === "PATCH" && id === undefined) {
    const body = await readJson(req);
    const code = text(body, "code", true)!.toUpperCase();
    const url = text(body, "url", true)!;
    if (!/^https?:\/\//.test(url) || /mail\.google\.com/.test(url)) {
      throw new HttpError(400, "url must be a direct http(s) posting link, not a Gmail link");
    }
    const result = db.prepare("UPDATE jobs SET url = ? WHERE code = ?").run(url, code);
    if (result.changes === 0) {
      throw new HttpError(404, "No job with that code");
    }
    send(res, 200, { ok: true, code, url });
    return true;
  }

  // Re-run skill detection over every job's title and description (after patterns or descriptions change).
  if (resource === "skills-recount" && method === "POST" && id === undefined) {
    const added = recountSkills(db);
    send(res, 200, { added, skills: listSkills() });
    return true;
  }

  // Set or replace a job's description by code and re-detect its skills: { code, description }.
  if (resource === "job-description" && method === "PATCH" && id === undefined) {
    const body = await readJson(req);
    const code = text(body, "code", true)!;
    const description = text(body, "description", true)!;
    const job = db.prepare("SELECT id, title FROM jobs WHERE code = ?").get(code) as
      | { id: number; title: string }
      | undefined;
    if (!job) {
      throw new HttpError(404, "No job with that code");
    }
    db.prepare("UPDATE jobs SET description = ? WHERE id = ?").run(description, job.id);
    const skills = detectSkills(`${job.title}\n${description}`);
    linkJobSkills(db, job.id, skills);
    send(res, 200, { ok: true, code, skills });
    return true;
  }

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
        linkJobSkills(db, jobId, [
          ...new Set([...skills, ...detectSkills(`${text(body, "role", true)}\n${text(body, "jobDescription") ?? ""}`)]),
        ]);
        db.prepare("INSERT INTO applications (job_id) VALUES (?)").run(jobId);
        assignJobCodes(db);
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

  // Recommended skills to learn, ranked by job-post demand.
  if (resource === "skill-recommendations" && method === "GET" && id === undefined) {
    send(res, 200, listRecommendations());
    return true;
  }

  // Start a draft learning path for a skill: { skill }. Steps are generic starters from the
  // skill's study links; edit them on the Path page.
  if (resource === "skill-path" && method === "POST" && id === undefined) {
    const body = await readJson(req);
    const name = text(body, "skill", true)!;
    const skill = db.prepare("SELECT id, name FROM skills WHERE name = ?").get(name) as
      | { id: number; name: string }
      | undefined;
    if (!skill) {
      throw new HttpError(404, "No skill with that name");
    }
    if (db.prepare("SELECT 1 FROM learning_paths WHERE lower(skill) = lower(?)").get(skill.name)) {
      throw new HttpError(409, "A path for that skill already exists");
    }
    const demand = (
      db.prepare("SELECT COUNT(*) AS n FROM job_skills WHERE skill_id = ?").get(skill.id) as { n: number }
    ).n;
    const links = studyLinks(skill.name);
    const info = db
      .prepare("INSERT INTO learning_paths (title, goal, skill) VALUES (?, ?, ?)")
      .run(
        `Learn ${skill.name}`,
        `${demand} saved job posts ask for ${skill.name}. Get hands-on exposure and be able to talk about it in interviews.`,
        skill.name,
      );
    const steps: [string, string, string][] = [
      [`Get the big picture of ${skill.name}`, "Read the overview or roadmap, note the core concepts.", links?.roadmap ?? links?.docs[0]?.url ?? ""],
      [`Work through the ${skill.name} docs`, "Follow the official getting-started guide end to end.", links?.docs[0]?.url ?? ""],
      [`Build a small project with ${skill.name}`, "Something you can show: a repo or demo that uses it for real.", ""],
      [`Practice ${skill.name} interview questions`, "Use the Learn page cards for this topic and write your own answers.", ""],
      [`Mark ${skill.name} as known`, "Once you have shipped something with it, update the Skills page.", ""],
    ];
    const add = db.prepare("INSERT INTO learning_steps (path_id, title, notes, url, position) VALUES (?, ?, ?, ?, ?)");
    steps.forEach(([title, notes, url], index) => add.run(Number(info.lastInsertRowid), title, notes, url, index + 1));
    send(res, 201, listRecommendations());
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
        name: text(body, "name"),
        legal_name: text(body, "legalName"),
        kind: oneOf(text(body, "kind"), COMPANY_KINDS, "kind"),
        linkedin_url: text(body, "linkedinUrl"),
        website: text(body, "website"),
        careers_url: text(body, "careersUrl"),
        industry: text(body, "industry"),
        size: text(body, "size"),
        notes: text(body, "notes"),
        priority: typeof body.priority === "boolean" ? (body.priority ? 1 : 0) : undefined,
        priority_note: text(body, "priorityNote"),
        brief: text(body, "brief"),
        enriched_on: body.enriched === true ? localDay() : undefined,
      });
      send(res, 200, listCompanies());
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    return true;
  }

  // Merge duplicate companies into one: { intoId, fromIds: [...] }. Jobs, contacts and contact
  // history move over; blank fields on the kept company are filled from the merged ones.
  if (resource === "company-merges" && method === "POST" && id === undefined) {
    const body = await readJson(req);
    const intoId = body.intoId;
    const fromIds = Array.isArray(body.fromIds) ? body.fromIds.filter((n): n is number => typeof n === "number") : [];
    if (typeof intoId !== "number" || fromIds.length === 0 || fromIds.includes(intoId)) {
      throw new HttpError(400, "intoId must be a number and fromIds a non-empty list that excludes it");
    }
    db.exec("BEGIN");
    try {
      for (const fromId of fromIds) {
        db.prepare(
          `UPDATE companies SET
             linkedin_url = COALESCE(NULLIF(linkedin_url, ''), (SELECT linkedin_url FROM companies WHERE id = ?)),
             website = COALESCE(NULLIF(website, ''), (SELECT website FROM companies WHERE id = ?)),
             careers_url = COALESCE(NULLIF(careers_url, ''), (SELECT careers_url FROM companies WHERE id = ?)),
             industry = COALESCE(NULLIF(industry, ''), (SELECT industry FROM companies WHERE id = ?)),
             size = COALESCE(NULLIF(size, ''), (SELECT size FROM companies WHERE id = ?))
           WHERE id = ?`,
        ).run(fromId, fromId, fromId, fromId, fromId, intoId);
        db.prepare("UPDATE jobs SET company_id = ? WHERE company_id = ?").run(intoId, fromId);
        db.prepare("UPDATE contacts SET company_id = ? WHERE company_id = ?").run(intoId, fromId);
        db.prepare("UPDATE contact_log SET company_id = ? WHERE company_id = ?").run(intoId, fromId);
        db.prepare("DELETE FROM companies WHERE id = ?").run(fromId);
      }
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    send(res, 200, listCompanies());
    return true;
  }

  // Attach or detach a hiring person on a job: POST/DELETE { jobId, contactId, role? }.
  if (resource === "job-contacts" && (method === "POST" || method === "DELETE") && id === undefined) {
    const body = await readJson(req);
    if (typeof body.jobId !== "number" || typeof body.contactId !== "number") {
      throw new HttpError(400, "jobId and contactId must be numbers");
    }
    if (method === "POST") {
      db.prepare("INSERT OR REPLACE INTO job_contacts (job_id, contact_id, role) VALUES (?, ?, ?)").run(
        body.jobId,
        body.contactId,
        text(body, "role") || "hiring",
      );
    } else {
      db.prepare("DELETE FROM job_contacts WHERE job_id = ? AND contact_id = ?").run(body.jobId, body.contactId);
    }
    send(res, 200, listApplications());
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
      const created = db.prepare(
        `INSERT INTO contacts (company_id, name, title, linkedin_url, email, phone, notes)
         VALUES (?, ?, ?, NULLIF(?, ''), ?, ?, ?) RETURNING id`,
      ).get(
        body.companyId,
        fields.name!,
        fields.title ?? "",
        fields.linkedin_url ?? "",
        fields.email ?? "",
        fields.phone ?? "",
        fields.notes ?? "",
      ) as { id: number };
      if (typeof body.jobId === "number") {
        db.prepare("INSERT OR IGNORE INTO job_contacts (job_id, contact_id) VALUES (?, ?)").run(body.jobId, created.id);
      }
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

  if (resource === "learn" && method === "GET" && id === undefined) {
    send(res, 200, learnOverview());
    return true;
  }

  if (resource === "learn-deck" && method === "GET" && id === undefined) {
    const params = new URL(req.url ?? "/", "http://localhost").searchParams;
    const limit = Math.min(50, Math.max(1, Number(params.get("limit") ?? 20) || 20));
    send(res, 200, learnDeck(params.get("topic") || null, limit));
    return true;
  }

  if (resource === "learn-review" && method === "POST" && id === undefined) {
    const body = await readJson(req);
    if (typeof body.cardId !== "number" || ![0, 1, 2, 3].includes(body.grade as number)) {
      throw new HttpError(400, "cardId must be a number and grade 0-3");
    }
    send(res, 200, reviewCard(body.cardId, body.grade as number));
    return true;
  }

  if (resource === "learn-cards" && method === "POST" && id === undefined) {
    const body = await readJson(req);
    const kind = oneOf(text(body, "kind"), CARD_KINDS, "kind") ?? "flashcard";
    const choices = Array.isArray(body.choices) ? body.choices.filter((c): c is string => typeof c === "string" && !!c.trim()) : [];
    if (kind === "mcq" && (choices.length < 2 || typeof body.correct !== "number" || !choices[body.correct])) {
      throw new HttpError(400, "Multiple choice needs at least two choices and a valid correct index");
    }
    const topic = text(body, "topic", true)!;
    const prompt = text(body, "prompt", true)!;
    const exists = db
      .prepare("SELECT id FROM learn_cards WHERE lower(topic) = lower(?) AND lower(prompt) = lower(?)")
      .get(topic, prompt);
    if (exists) {
      throw new HttpError(409, "A card with this question already exists");
    }
    db.prepare(
      `INSERT INTO learn_cards (topic, kind, prompt, answer, choices, correct, explanation, script, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      topic,
      kind,
      prompt,
      text(body, "answer") ?? "",
      JSON.stringify(choices),
      kind === "mcq" ? (body.correct as number) : null,
      text(body, "explanation") ?? "",
      text(body, "script") ?? "",
      text(body, "source") || "manual",
    );
    send(res, 201, learnOverview());
    return true;
  }

  if (resource === "learn-guides" && method === "GET" && id === undefined) {
    send(res, 200, learnGuides());
    return true;
  }

  if (resource === "learn-answers") {
    if (method === "GET" && id === undefined) {
      // Answers still waiting for feedback, with what's needed to judge them.
      send(
        res,
        200,
        db
          .prepare(
            `SELECT a.id, a.card_id AS cardId, a.answer, a.written_on AS writtenOn, c.topic, c.kind,
                    c.prompt, c.answer AS modelAnswer, c.script
               FROM learn_answers a JOIN learn_cards c ON c.id = a.card_id
              WHERE a.feedback = '' ORDER BY a.id`,
          )
          .all(),
      );
    } else if (method === "POST" && id === undefined) {
      const body = await readJson(req);
      if (typeof body.cardId !== "number") {
        throw new HttpError(400, "cardId must be a number");
      }
      db.prepare("INSERT INTO learn_answers (card_id, answer, written_on) VALUES (?, ?, ?)").run(
        body.cardId,
        text(body, "answer", true)!,
        localDay(),
      );
      send(res, 201, { ok: true });
    } else if (method === "PATCH" && id !== undefined) {
      const body = await readJson(req);
      update("learn_answers", id, { feedback: text(body, "feedback", true), reviewed_on: localDay() });
      send(res, 200, { ok: true });
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    return true;
  }

  // Lets the morning task refresh a card's script or bring a weak card back today.
  if (resource === "learn-cards" && method === "PATCH" && id !== undefined) {
    const body = await readJson(req);
    update("learn_cards", id, {
      script: text(body, "script"),
      due_on: body.dueToday === true ? localDay() : undefined,
    });
    send(res, 200, { ok: true });
    return true;
  }

  if (resource === "learn-digest" && method === "PUT" && id === undefined) {
    const body = await readJson(req);
    db.prepare(
      "INSERT INTO meta (key, value) VALUES ('learn.digest', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    ).run(JSON.stringify({ text: text(body, "text", true), on: localDay() }));
    send(res, 200, { ok: true });
    return true;
  }

  if (resource === "learning-paths") {
    const body = method === "GET" || method === "DELETE" ? {} : await readJson(req);
    if (method === "POST" && id === undefined) {
      const info = db
        .prepare("INSERT INTO learning_paths (title, goal, skill) VALUES (?, ?, ?)")
        .run(text(body, "title", true)!, text(body, "goal") ?? "", text(body, "skill") ?? "");
      const steps = Array.isArray(body.steps) ? (body.steps as Record<string, unknown>[]) : [];
      const add = db.prepare("INSERT INTO learning_steps (path_id, title, notes, url, position) VALUES (?, ?, ?, ?, ?)");
      steps.forEach((step, index) =>
        add.run(Number(info.lastInsertRowid), text(step, "title", true)!, text(step, "notes") ?? "", text(step, "url") ?? "", index + 1),
      );
    } else if (method === "PATCH" && id !== undefined) {
      update("learning_paths", id, { title: text(body, "title"), goal: text(body, "goal"), skill: text(body, "skill") });
    } else if (method === "DELETE" && id !== undefined) {
      db.prepare("DELETE FROM learning_paths WHERE id = ?").run(id);
    } else if (method !== "GET" || id !== undefined) {
      throw new HttpError(405, "Method not allowed");
    }
    send(res, method === "POST" ? 201 : 200, listPaths());
    return true;
  }

  if (resource === "learning-steps") {
    const body = method === "DELETE" ? {} : await readJson(req);
    if (method === "POST" && id === undefined) {
      if (typeof body.pathId !== "number") throw new HttpError(400, "pathId must be a number");
      db.prepare(
        `INSERT INTO learning_steps (path_id, title, notes, url, position)
         VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(position), 0) + 1 FROM learning_steps WHERE path_id = ?))`,
      ).run(body.pathId, text(body, "title", true)!, text(body, "notes") ?? "", text(body, "url") ?? "", body.pathId);
    } else if (method === "PATCH" && id !== undefined) {
      const status = text(body, "status");
      if (status !== undefined && !["todo", "doing", "done"].includes(status)) throw new HttpError(400, "Invalid status");
      update("learning_steps", id, {
        title: text(body, "title"),
        notes: text(body, "notes"),
        url: text(body, "url"),
        status,
        done_at: status === undefined ? undefined : status === "done" ? new Date().toISOString() : "",
      });
    } else if (method === "DELETE" && id !== undefined) {
      db.prepare("DELETE FROM learning_steps WHERE id = ?").run(id);
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    send(res, method === "POST" ? 201 : 200, listPaths());
    return true;
  }

  if (resource === "preferences") {
    const body = method === "POST" ? await readJson(req) : {};
    if (method === "POST" && id === undefined) {
      const kind = text(body, "kind") ?? "like";
      if (!["like", "avoid", "rule"].includes(kind)) throw new HttpError(400, "Invalid kind");
      db.prepare("INSERT INTO preferences (kind, text, source) VALUES (?, ?, ?)").run(kind, text(body, "text", true)!, text(body, "source") ?? "chat");
    } else if (method === "DELETE" && id !== undefined) {
      db.prepare("DELETE FROM preferences WHERE id = ?").run(id);
    } else if (method !== "GET" || id !== undefined) {
      throw new HttpError(405, "Method not allowed");
    }
    send(res, method === "POST" ? 201 : 200, listPreferences());
    return true;
  }

  if (resource === "library-file" && method === "GET" && id !== undefined) {
    const row = db.prepare("SELECT file_name, mime, data FROM library_items WHERE id = ? AND kind = 'file'").get(id) as
      | { file_name: string; mime: string; data: Uint8Array }
      | undefined;
    if (!row) throw new HttpError(404, "Not found");
    res.writeHead(200, {
      "Content-Type": row.mime || "application/octet-stream",
      "Content-Disposition": `inline; filename="${row.file_name.replace(/[^\w.\- ]/g, "_")}"`,
      "Cache-Control": "no-store",
    });
    res.end(Buffer.from(row.data));
    return true;
  }

  if (resource === "library") {
    const body = method === "POST" || method === "PATCH" ? await readJson(req) : {};
    if (method === "POST" && id === undefined) {
      const kind = text(body, "kind", true)!;
      if (kind === "text") {
        db.prepare("INSERT INTO library_items (kind, title, body) VALUES ('text', ?, ?)").run(
          text(body, "title", true)!,
          text(body, "body", true)!,
        );
      } else if (kind === "file") {
        const data = Buffer.from(text(body, "dataBase64", true)!, "base64");
        db.prepare("INSERT INTO library_items (kind, title, file_name, mime, size, data) VALUES ('file', ?, ?, ?, ?, ?)").run(
          text(body, "title", true)!,
          text(body, "fileName", true)!,
          text(body, "mime") ?? "",
          data.length,
          data,
        );
      } else {
        throw new HttpError(400, "kind must be text or file");
      }
    } else if (method === "PATCH" && id !== undefined) {
      update("library_items", id, { title: text(body, "title"), body: text(body, "body") });
    } else if (method === "DELETE" && id !== undefined) {
      db.prepare("DELETE FROM library_items WHERE id = ?").run(id);
    } else if (method !== "GET" || id !== undefined) {
      throw new HttpError(405, "Method not allowed");
    }
    send(res, method === "POST" ? 201 : 200, listLibrary());
    return true;
  }

  if (resource === "improvements") {
    if (method === "GET" && id === undefined) {
      scanImprovements(db);
    } else if (method === "POST" && id === undefined) {
      const body = await readJson(req);
      const today = localDay();
      const impact = typeof body.impact === "number" && [1, 2, 3].includes(body.impact) ? body.impact : 2;
      db.prepare(
        `INSERT INTO improvements (area, title, why, how, source, due_on, impact, written_by, created_on, updated_on)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'claude', ?, ?)`,
      ).run(
        oneOf(text(body, "area"), [...AREAS], "area") ?? "other",
        text(body, "title", true)!,
        text(body, "why") ?? "",
        text(body, "how") ?? "",
        text(body, "source") ?? "",
        text(body, "dueOn") ?? "",
        impact,
        today,
        today,
      );
    } else if (method === "PATCH" && id !== undefined) {
      // Med sends { status }; Claude sends { why, how, ... } and the row is marked as written by Claude.
      const body = await readJson(req);
      const status = oneOf(text(body, "status"), ["open", "done", "dismissed"], "status");
      const today = localDay();
      const wrote = body.why !== undefined || body.how !== undefined;
      update("improvements", id, {
        title: text(body, "title"),
        why: text(body, "why"),
        how: text(body, "how"),
        source: text(body, "source"),
        due_on: text(body, "dueOn"),
        status,
        closed_by: status === undefined ? undefined : status === "open" ? "" : "me",
        closed_on: status === undefined ? undefined : status === "open" ? "" : today,
        written_by: wrote ? "claude" : undefined,
        updated_on: today,
      });
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    send(res, method === "POST" ? 201 : 200, listImprovements(db));
    return true;
  }

  // The scheduled task calls this after rewriting why/how, so the page can show when.
  if (resource === "improvements-refreshed" && method === "PUT" && id === undefined) {
    db.prepare(
      "INSERT INTO meta (key, value) VALUES ('improvements.refreshed', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    ).run(localDay());
    send(res, 200, listImprovements(db));
    return true;
  }

  if (resource === "todos") {
    if (method === "GET" && id === undefined) {
      send(res, 200, listTodos());
      return true;
    }
    if (method === "POST" && id === undefined) {
      const body = await readJson(req);
      db.prepare(
        "INSERT INTO todos (title, notes, position) VALUES (?, ?, (SELECT COALESCE(MAX(position), 0) + 1 FROM todos))",
      ).run(text(body, "title", true)!, text(body, "notes") ?? "");
    } else if (method === "PATCH" && id !== undefined) {
      const body = await readJson(req);
      const done = typeof body.done === "boolean" ? body.done : undefined;
      update("todos", id, {
        title: text(body, "title"),
        notes: text(body, "notes"),
        done: done === undefined ? undefined : done ? 1 : 0,
        done_at: done === undefined ? undefined : done ? new Date().toISOString() : "",
      });
    } else if (method === "DELETE" && id !== undefined) {
      db.prepare("DELETE FROM todos WHERE id = ?").run(id);
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    send(res, method === "POST" ? 201 : 200, listTodos());
    return true;
  }

  if (resource === "outreach") {
    if (method === "GET" && id === undefined) {
      send(res, 200, listOutreach());
      return true;
    }
    if (method === "POST" && id === undefined) {
      const body = await readJson(req);
      if (typeof body.companyId !== "number") {
        throw new HttpError(400, "companyId must be a number");
      }
      const optional = (key: string) => (typeof body[key] === "number" ? (body[key] as number) : null);
      db.prepare(
        `INSERT INTO outreach (company_id, job_id, contact_id, channel, subject, body, created_on, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        body.companyId,
        optional("jobId"),
        optional("contactId"),
        text(body, "channel") || "LinkedIn",
        text(body, "subject") ?? "",
        text(body, "body", true)!,
        localDay(),
        text(body, "source") || "manual",
      );
    } else if (method === "PATCH" && id !== undefined) {
      const body = await readJson(req);
      const status = oneOf(text(body, "status"), OUTREACH_STATUSES, "status");
      update("outreach", id, {
        body: text(body, "body"),
        subject: text(body, "subject"),
        channel: text(body, "channel"),
        status,
        follow_up_on: text(body, "followUpOn"),
        sent_on: status === "sent" ? localDay() : undefined,
      });
      if (status === "sent" || status === "replied") {
        // Keep the contact history in step: marking sent or replied logs the touch once.
        const row = db
          .prepare("SELECT company_id AS companyId, job_id AS jobId, contact_id AS contactId, channel, subject FROM outreach WHERE id = ?")
          .get(id) as { companyId: number; jobId: number | null; contactId: number | null; channel: string; subject: string };
        const direction = status === "sent" ? "out" : "in";
        const marker = `[outreach #${id} ${status}]`;
        const exists = db.prepare("SELECT 1 FROM contact_log WHERE summary LIKE ?").get(`${marker}%`);
        if (!exists) {
          db.prepare(
            `INSERT INTO contact_log (company_id, contact_id, job_id, channel, direction, happened_on, summary, follow_up_on)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          ).run(
            row.companyId,
            row.contactId,
            row.jobId,
            row.channel,
            direction,
            localDay(),
            `${marker} ${status === "sent" ? "Message sent" : "They replied"}${row.subject ? `: ${row.subject}` : ""}`,
            status === "sent" ? localDay(5) : "",
          );
          if (status === "sent") {
            db.prepare("UPDATE outreach SET follow_up_on = COALESCE(NULLIF(follow_up_on, ''), ?) WHERE id = ?").run(localDay(5), id);
          }
        }
      }
    } else if (method === "DELETE" && id !== undefined) {
      db.prepare("DELETE FROM outreach WHERE id = ?").run(id);
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    send(res, method === "POST" ? 201 : 200, listOutreach());
    return true;
  }

  if (resource === "interviews") {
    if (method === "GET" && id === undefined) {
      send(res, 200, listInterviews());
      return true;
    }
    if (method === "POST" && id === undefined) {
      const body = await readJson(req);
      if (typeof body.jobId !== "number") {
        throw new HttpError(400, "jobId must be a number");
      }
      db.prepare(
        "INSERT INTO interviews (job_id, round, scheduled_on, with_whom, format, prep) VALUES (?, ?, ?, ?, ?, ?)",
      ).run(
        body.jobId,
        text(body, "round") || "Screen",
        text(body, "scheduledOn") ?? "",
        text(body, "withWhom") ?? "",
        text(body, "format") || "Video",
        text(body, "prep") ?? "",
      );
      // A scheduled round means the application is at least in the interview stage.
      db.prepare(
        "UPDATE applications SET status = 'Interviewing' WHERE job_id = ? AND status IN ('Saved', 'Applied')",
      ).run(body.jobId);
    } else if (method === "PATCH" && id !== undefined) {
      const body = await readJson(req);
      update("interviews", id, {
        round: text(body, "round"),
        scheduled_on: text(body, "scheduledOn"),
        with_whom: text(body, "withWhom"),
        format: text(body, "format"),
        prep: text(body, "prep"),
        notes: text(body, "notes"),
        outcome: oneOf(text(body, "outcome"), INTERVIEW_OUTCOMES, "outcome"),
      });
    } else if (method === "DELETE" && id !== undefined) {
      db.prepare("DELETE FROM interviews WHERE id = ?").run(id);
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    send(res, method === "POST" ? 201 : 200, listInterviews());
    return true;
  }

  if (resource === "offers") {
    if (method === "POST" && id === undefined) {
      const body = await readJson(req);
      if (typeof body.jobId !== "number") {
        throw new HttpError(400, "jobId must be a number");
      }
      db.prepare(
        "INSERT INTO offers (job_id, pay, schedule, benefits, growth, notes, received_on) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ).run(
        body.jobId,
        text(body, "pay") ?? "",
        text(body, "schedule") ?? "",
        text(body, "benefits") ?? "",
        text(body, "growth") ?? "",
        text(body, "notes") ?? "",
        localDay(),
      );
      db.prepare("UPDATE applications SET status = 'Offer' WHERE job_id = ? AND status != 'Offer'").run(body.jobId);
    } else if (method === "PATCH" && id !== undefined) {
      const body = await readJson(req);
      update("offers", id, {
        pay: text(body, "pay"),
        schedule: text(body, "schedule"),
        benefits: text(body, "benefits"),
        growth: text(body, "growth"),
        notes: text(body, "notes"),
        decision: oneOf(text(body, "decision"), OFFER_DECISIONS, "decision"),
      });
    } else if (method === "DELETE" && id !== undefined) {
      db.prepare("DELETE FROM offers WHERE id = ?").run(id);
    } else {
      throw new HttpError(405, "Method not allowed");
    }
    send(res, method === "POST" ? 201 : 200, listInterviews());
    return true;
  }

  if (resource === "weekly" && method === "GET" && id === undefined) {
    send(res, 200, weekly());
    return true;
  }

  // Pay targets (PHP per month). GET returns them; PUT { min?, ideal? } changes them.
  if (resource === "targets" && (method === "GET" || method === "PUT") && id === undefined) {
    if (method === "PUT") {
      const body = await readJson(req);
      for (const [key, field] of [["min", "target.pay_min"], ["ideal", "target.pay_ideal"]] as const) {
        if (typeof body[key] === "number" && body[key] > 0) {
          db.prepare("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(
            field,
            String(Math.round(body[key] as number)),
          );
        }
      }
    }
    const get = (key: string, fallback: number) =>
      Number((db.prepare("SELECT value FROM meta WHERE key = ?").get(key) as { value: string } | undefined)?.value ?? fallback);
    send(res, 200, { min: get("target.pay_min", 80000), ideal: get("target.pay_ideal", 150000), currency: "PHP", per: "month" });
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
      assignJobCodes(db);
      backfillPay(db);
      db.exec("COMMIT");
      send(res, 200, results);
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    return true;
  }

  if (resource === "roles") {
    if (method === "GET" && id === undefined) {
      send(res, 200, listRoles());
    } else if (method === "PATCH" && id !== undefined) {
      const body = await readJson(req);
      if (typeof body.active !== "boolean") {
        throw new HttpError(400, "active must be a boolean");
      }
      update("qualification_roles", id, { active: body.active ? 1 : 0 });
      send(res, 200, listRoles());
    } else {
      throw new HttpError(405, "Method not allowed");
    }
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
    if (path.startsWith("/api/") && path !== "/api/resume") {
      await requireUser(req);
    }
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
