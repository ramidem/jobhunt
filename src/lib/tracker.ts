export const APPLICATION_STATUSES = [
  "Saved",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export const SKILL_STATUSES = ["know", "learning", "want"] as const;
export type SkillStatus = (typeof SKILL_STATUSES)[number];
