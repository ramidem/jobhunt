export const APPLICATIONS_KEY = "tracker.applications.v1";
export const SKILLS_KEY = "tracker.skills.v1";

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
};

export function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
