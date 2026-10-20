// Improvements: things Med can do better, flagged automatically from Learn and the tracker.
// Rules own `signal` items (what/where/when plus a plain why/how); the scheduled task rewrites
// why/how with specifics and adds custom items. Items close themselves when the signal clears.
import type { DatabaseSync } from "node:sqlite";

export const AREAS = ["learning", "applications", "other"] as const;
const MAX_OPEN_FROM_RULES = 10;

type Candidate = {
  signal: string;
  area: (typeof AREAS)[number];
  impact: number; // 1 low, 3 high
  title: string;
  why: string;
  how: string;
  source: string;
  dueOn?: string;
};

const day = (offset: number) => new Date(Date.now() + offset * 864e5).toLocaleDateString("en-CA");

const who = (company: string) => (/^unknown/i.test(company) ? "an unnamed employer" : company);

function candidates(db: DatabaseSync): Candidate[] {
  const today = day(0);
  const out: Candidate[] = [];
  const all = <T>(sql: string, ...params: (string | number)[]) => db.prepare(sql).all(...params) as T[];
  const one = <T>(sql: string, ...params: (string | number)[]) => db.prepare(sql).get(...params) as T;

  // --- Learning ---
  const lastReview = one<{ d: string | null }>("SELECT MAX(reviewed_on) AS d FROM learn_reviews").d;
  if (!lastReview || lastReview <= day(-3)) {
    out.push({
      signal: "learn-idle",
      area: "learning",
      impact: 3,
      title: "No Learn cards reviewed in the last 3 days",
      why: "Spaced repetition only works when reviews happen close to their due dates; gaps make cards reset to hard.",
      how: "Do one 10-minute Learn session today, even if it is only the due cards.",
      source: lastReview ? `Learn reviews, last one on ${lastReview}` : "Learn reviews, none yet",
    });
  }

  const backlog = one<{ n: number }>(
    "SELECT COUNT(*) AS n FROM learn_cards WHERE reps > 0 AND due_on <= ?",
    today,
  ).n;
  if (backlog >= 15) {
    out.push({
      signal: "learn-backlog",
      area: "learning",
      impact: 2,
      title: `${backlog} Learn cards are overdue`,
      why: "A growing backlog means reviews are spaced further apart than planned, so you forget more between them.",
      how: "Clear the backlog in two or three short sessions rather than one long one; start with the Learning skills.",
      source: "Learn cards due today or earlier",
      dueOn: today,
    });
  }

  const weak = all<{ topic: string; total: number; missed: number }>(
    `SELECT c.topic, COUNT(*) AS total, SUM(r.grade = 0) AS missed
       FROM learn_reviews r JOIN learn_cards c ON c.id = r.card_id
      WHERE r.reviewed_on >= ? GROUP BY c.topic HAVING total >= 4 AND missed * 1.0 / total >= 0.4
      ORDER BY missed * 1.0 / total DESC LIMIT 4`,
    day(-14),
  );
  for (const row of weak) {
    out.push({
      signal: `learn-weak:${row.topic}`,
      area: "learning",
      impact: 3,
      title: `${row.topic}: missed ${row.missed} of ${row.total} recent reviews`,
      why: "A miss rate this high means the idea is not sticking yet, and this topic is on your resume or interview list.",
      how: `Re-read the ${row.topic} docs or roadmap links on the Learn page, then redo only the missed cards.`,
      source: `Learn reviews for ${row.topic}, last 14 days`,
    });
  }

  const uncovered = all<{ name: string; n: number }>(
    `SELECT s.name, (SELECT COUNT(*) FROM learn_cards c WHERE lower(c.topic) = lower(s.name)) AS n
       FROM skills s WHERE s.status IN ('know', 'learning') ORDER BY n, s.name`,
  ).filter((row) => row.n < 3);
  if (uncovered.length > 0) {
    out.push({
      signal: "learn-coverage",
      area: "learning",
      impact: 2,
      title: `${uncovered.length} skills you list have fewer than 3 study cards`,
      why: "You can only be quizzed on what has cards, and interviewers ask about every skill on your resume.",
      how: "Ask Claude to write cards for these skills, or add your own on the Learn page.",
      source: `Skills page and Learn cards: ${uncovered.slice(0, 12).map((row) => row.name).join(", ")}${uncovered.length > 12 ? ", ..." : ""}`,
    });
  }

  const pending = one<{ n: number; oldest: string | null }>(
    "SELECT COUNT(*) AS n, MIN(written_on) AS oldest FROM learn_answers WHERE feedback = '' AND written_on <= ?",
    day(-1),
  );
  if (pending.n > 0) {
    out.push({
      signal: "learn-feedback-pending",
      area: "learning",
      impact: 1,
      title: `${pending.n} written answer${pending.n === 1 ? "" : "s"} still waiting for feedback`,
      why: "Feedback is how a practice answer turns into an improvement; without it the answer is just a draft.",
      how: "The morning Learn task writes feedback; if it keeps waiting, ask Claude to review it now.",
      source: `Learn answers, oldest written ${pending.oldest}`,
    });
  }

  // --- Applications ---
  const stale = all<{ id: number; company: string; role: string; appliedOn: string }>(
    `SELECT a.id, c.name AS company, j.title AS role, a.applied_on AS appliedOn
       FROM applications a JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
      WHERE a.status = 'Applied' AND a.applied_on != '' AND a.applied_on <= ?
        AND NOT EXISTS (SELECT 1 FROM interviews i WHERE i.job_id = a.job_id)
      ORDER BY a.applied_on LIMIT 6`,
    day(-10),
  );
  for (const row of stale) {
    const days = Math.round((Date.parse(today) - Date.parse(row.appliedOn)) / 864e5);
    out.push({
      signal: `app-stale:${row.id}`,
      area: "applications",
      impact: 2,
      title: `No reply from ${who(row.company)} after ${days} days (${row.role})`,
      why: "Most replies come in the first week or two; after that a polite nudge or a warm contact is how an application gets noticed.",
      how: "Find a hiring contact on the company page and send a short follow-up, or mark it Withdrawn and move on.",
      source: `Applications page, applied on ${row.appliedOn}`,
      dueOn: day(0),
    });
  }

  const followUps = all<{ id: number; company: string; followUpOn: string }>(
    `SELECT o.id, c.name AS company, o.follow_up_on AS followUpOn
       FROM outreach o JOIN companies c ON c.id = o.company_id
      WHERE o.status = 'sent' AND o.follow_up_on != '' AND o.follow_up_on <= ? ORDER BY o.follow_up_on LIMIT 6`,
    today,
  );
  for (const row of followUps) {
    out.push({
      signal: `outreach-followup:${row.id}`,
      area: "applications",
      impact: 2,
      title: `Follow up with ${who(row.company)} (outreach is past its follow-up date)`,
      why: "A single follow-up roughly doubles the chance of a reply; a message with no follow-up is easy to lose.",
      how: "Open the outreach draft, add one new line (something about the company), and send the follow-up.",
      source: "Outreach page",
      dueOn: row.followUpOn,
    });
  }

  const idlePriority = all<{ id: number; company: string; role: string; createdAt: string }>(
    `SELECT a.id, c.name AS company, j.title AS role, substr(j.created_at, 1, 10) AS createdAt
       FROM applications a JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
      WHERE a.status = 'Saved' AND j.priority = 1 AND substr(j.created_at, 1, 10) <= ?
      ORDER BY j.created_at LIMIT 4`,
    day(-7),
  );
  for (const row of idlePriority) {
    out.push({
      signal: `app-priority-idle:${row.id}`,
      area: "applications",
      impact: 3,
      title: `Priority job not applied to yet: ${who(row.company)} (${row.role})`,
      why: "You marked it Priority a week or more ago; postings close or fill, and early applicants get seen first.",
      how: "Apply this week using the tailored resume, or remove the Priority flag if it no longer fits.",
      source: `Applications page, saved on ${row.createdAt}`,
    });
  }

  const gaps = all<{ name: string; demand: number }>(
    `SELECT s.name, COUNT(js.job_id) AS demand
       FROM skills s JOIN job_skills js ON js.skill_id = s.id
      WHERE s.status = 'want' AND NOT EXISTS (SELECT 1 FROM learning_paths p WHERE lower(p.skill) = lower(s.name))
      GROUP BY s.id HAVING demand >= 5 ORDER BY demand DESC LIMIT 3`,
  );
  for (const row of gaps) {
    out.push({
      signal: `skill-gap:${row.name}`,
      area: "applications",
      impact: 2,
      title: `${row.name} appears in ${row.demand} saved jobs and you have no learning path for it`,
      why: "Repeated demand across postings means it filters out applications; a small portfolio piece closes the gap fast.",
      how: "Start a path from the Learning path page, then add a small project that uses it.",
      source: "Skills page and saved job postings",
    });
  }

  return out;
}

export function scanImprovements(db: DatabaseSync) {
  const today = day(0);
  const found = candidates(db);
  const firing = new Set(found.map((item) => item.signal));

  // Items whose signal stopped firing are done; custom items (no signal) are never auto-closed.
  const openWithSignal = db
    .prepare("SELECT id, signal FROM improvements WHERE status = 'open' AND signal IS NOT NULL")
    .all() as { id: number; signal: string }[];
  const close = db.prepare(
    "UPDATE improvements SET status = 'done', closed_by = 'auto', closed_on = ?, updated_on = ? WHERE id = ?",
  );
  for (const row of openWithSignal) {
    if (!firing.has(row.signal)) close.run(today, today, row.id);
  }

  let openRule = (
    db.prepare("SELECT COUNT(*) AS n FROM improvements WHERE status = 'open' AND signal IS NOT NULL").get() as {
      n: number;
    }
  ).n;
  const find = db.prepare("SELECT id, status, closed_by AS closedBy, written_by AS writtenBy FROM improvements WHERE signal = ?");
  const insert = db.prepare(
    `INSERT INTO improvements (area, title, why, how, source, due_on, impact, signal, written_by, created_on, updated_on)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'rule', ?, ?)`,
  );
  const refreshRule = db.prepare(
    `UPDATE improvements SET title = ?, why = ?, how = ?, source = ?, due_on = ?, impact = ?, updated_on = ?,
            status = 'open', closed_by = '', closed_on = '' WHERE id = ?`,
  );
  const refreshFacts = db.prepare(
    "UPDATE improvements SET title = ?, source = ?, due_on = ?, impact = ?, updated_on = ?, status = 'open', closed_by = '', closed_on = '' WHERE id = ?",
  );

  for (const item of [...found].sort((a, b) => b.impact - a.impact)) {
    const row = find.get(item.signal) as { id: number; status: string; closedBy: string; writtenBy: string } | undefined;
    if (!row) {
      if (openRule >= MAX_OPEN_FROM_RULES) continue;
      insert.run(item.area, item.title, item.why, item.how, item.source, item.dueOn ?? "", item.impact, item.signal, today, today);
      openRule += 1;
    } else if (row.status === "open" || row.closedBy === "auto") {
      if (row.status !== "open") {
        if (openRule >= MAX_OPEN_FROM_RULES) continue;
        openRule += 1;
      }
      // Keep Claude's why/how if it has written them; only refresh the facts.
      if (row.writtenBy === "claude") refreshFacts.run(item.title, item.source, item.dueOn ?? "", item.impact, today, row.id);
      else refreshRule.run(item.title, item.why, item.how, item.source, item.dueOn ?? "", item.impact, today, row.id);
    }
    // Dismissed, or done by Med: leave it alone.
  }
}

export function listImprovements(db: DatabaseSync) {
  const select = `SELECT id, area, title, why, how, source, due_on AS dueOn, impact, status, written_by AS writtenBy,
                         closed_by AS closedBy, created_on AS createdOn, closed_on AS closedOn FROM improvements`;
  const refreshed = db.prepare("SELECT value FROM meta WHERE key = 'improvements.refreshed'").get() as
    | { value: string }
    | undefined;
  return {
    refreshedOn: refreshed?.value ?? null,
    open: db.prepare(`${select} WHERE status = 'open' ORDER BY impact DESC, (due_on = '') , due_on, id`).all(),
    closed: db.prepare(`${select} WHERE status != 'open' ORDER BY closed_on DESC, id DESC LIMIT 40`).all(),
  };
}
