export const APPLICATION_STATUSES = [
  "Saved",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const SKILL_STATUSES = ["know", "learning", "want"] as const;
export type SkillStatus = (typeof SKILL_STATUSES)[number];
