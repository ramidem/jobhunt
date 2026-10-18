export const APPLICATIONS_KEY = "tracker.applications.v1";
export const SKILLS_KEY = "tracker.skills.v1";
export const SEEDED_KEY = "tracker.seeded.v1";

export const APPLICATION_STATUSES = [
  "Saved",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type Application = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  url: string;
  appliedOn: string;
  notes: string;
  jobDescription: string;
  matchPercent: number | null;
  createdAt: string;
};

export const SKILL_STATUSES = ["know", "learning", "want"] as const;
export type SkillStatus = (typeof SKILL_STATUSES)[number];

export type Skill = {
  id: string;
  name: string;
  status: SkillStatus;
  demand?: number;
};

export function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// Returns seeds this browser hasn't received yet and marks them received,
// so deleted seed entries don't come back on the next visit.
export function takeUnseeded<T extends { id: string }>(seeds: T[]): T[] {
  try {
    const seeded = new Set<string>(JSON.parse(window.localStorage.getItem(SEEDED_KEY) ?? "[]"));
    const fresh = seeds.filter((seed) => !seeded.has(seed.id));
    if (fresh.length > 0) {
      fresh.forEach((seed) => seeded.add(seed.id));
      window.localStorage.setItem(SEEDED_KEY, JSON.stringify([...seeded]));
    }
    return fresh;
  } catch {
    return [];
  }
}
