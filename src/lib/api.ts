"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApplicationStatus, SkillStatus } from "@/lib/tracker";

export type JobSkill = { name: string; status: SkillStatus };

export type Application = {
  id: number;
  jobId: number;
  code: string;
  companyId: number;
  company: string;
  companyLinkedin: string;
  role: string;
  url: string;
  source: string;
  details: string;
  location: string;
  workType: string;
  employmentType: string;
  salary: string;
  payMin: number | null;
  payMax: number | null;
  payHourly: number;
  postedOn: string;
  applicants: string;
  jobDescription: string;
  priority: boolean;
  companyPriority: boolean;
  companyKind: CompanyKind;
  companyBrief: string;
  companyWebsite: string;
  companyCareers: string;
  clientNote: string;
  contacts: (Contact & { role: string; jobId: number })[];
  companyContacts: Contact[];
  lastContactedOn: string | null;
  createdAt: string;
  status: ApplicationStatus;
  appliedOn: string;
  notes: string;
  skills: JobSkill[];
  matchPercent: number | null;
};

export type CompanyKind = "employer" | "agency" | "confidential" | "unknown";

export type Skill = { id: number; name: string; status: SkillStatus; demand: number };

export type SkillRecommendation = {
  id: number;
  name: string;
  status: SkillStatus;
  demand: number;
  pathId: number | null;
  examples: { code: string; title: string; company: string }[];
};

export type SkillRecommendations = { totalJobs: number; jobsWithSkills: number; skills: SkillRecommendation[] };

export type Contact = {
  id: number;
  companyId: number;
  name: string;
  title: string;
  linkedinUrl: string | null;
  email: string;
  phone: string;
  notes: string;
};

export type LogEntry = {
  id: number;
  companyId: number;
  company: string;
  contactId: number | null;
  contactName: string | null;
  jobId: number | null;
  jobTitle: string | null;
  channel: string;
  direction: "out" | "in";
  happenedOn: string;
  summary: string;
  followUpOn: string;
};

export type Company = {
  id: number;
  name: string;
  priority: boolean;
  priorityNote: string;
  brief: string;
  legalName: string;
  kind: CompanyKind;
  careersUrl: string;
  enrichedOn: string;
  linkedinUrl: string;
  website: string;
  industry: string;
  size: string;
  notes: string;
  jobCount: number;
  appliedCount: number;
  sources: string[];
  lastContactedOn: string | null;
  contacts: Contact[];
  jobs: {
    id: number;
    code: string;
    priority: boolean;
    title: string;
    url: string;
    clientNote: string;
    contactIds: number[];
    applicationId: number | null;
    status: ApplicationStatus | null;
  }[];
  log: LogEntry[];
};

export type Dashboard = {
  totals: {
    jobs: number;
    companies: number;
    contacts: number;
    contactedThisWeek: number;
    neverContacted: number;
  };
  pipeline: { status: ApplicationStatus; count: number }[];
  sources: { source: string; count: number }[];
  followUps: {
    kind: "log" | "applied";
    companyId: number;
    company: string;
    contactName: string | null;
    due: string;
    reason: string;
  }[];
  topGaps: { name: string; demand: number }[];
  recent: LogEntry[];
  activeRoles: { id: number; title: string }[];
  funnel: Funnel;
  draftsToSend: number;
};

export type NewLogEntry = {
  companyId: number;
  contactId?: number;
  jobId?: number;
  channel: string;
  direction: "out" | "in";
  happenedOn: string;
  summary: string;
  followUpOn: string;
};

export type Role = {
  id: number;
  title: string;
  updated: string | null;
  active: boolean;
  degree: string[];
  skills: { name: string; optional: boolean; known: boolean }[];
  soft: string[];
};
export type Roles = { source: string; note: string; roles: Role[] };

export async function api<T>(path: string, init?: { method: string; body?: unknown }): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method: init?.method ?? "GET",
    headers: init?.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed (${response.status})`);
  }
  return data as T;
}

// Loads one API resource and lets mutations replace it with the list the server returns.
export function useResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api<T>(path)
      .then((value) => {
        setData(value);
        setError(null);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [path]);

  useEffect(load, [load]);

  const mutate = useCallback(
    async (subpath: string, method: string, body?: unknown) => {
      try {
        setData(await api<T>(subpath, { method, body }));
        setError(null);
      } catch (reason) {
        setError((reason as Error).message);
      }
    },
    [],
  );

  return { data, error, mutate, reload: load };
}

export type StudyLinks = { roadmap?: string; docs: { label: string; url: string }[] } | null;

export type LearnTopic = {
  name: string;
  status: "know" | "learning" | "interview";
  cards: number;
  fresh: number;
  due: number;
  links: StudyLinks;
};

export type LearnOverview = {
  digest: { text: string; on: string } | null;
  topics: LearnTopic[];
  stats: { due: number; fresh: number; cards: number; reviewedToday: number; streak: number };
};

export type LearnCard = {
  id: number;
  topic: string;
  kind: "flashcard" | "mcq" | "practice" | "soft";
  prompt: string;
  answer: string;
  choices: string[];
  correct: number | null;
  explanation: string;
  script: string;
  feedback: string | null;
  reps: number;
  links: StudyLinks;
};

export type LearnGuide = {
  id: number;
  topic: string;
  kind: LearnCard["kind"];
  prompt: string;
  script: string;
  feedback: string | null;
};

export type Todo = {
  id: number;
  title: string;
  notes: string;
  done: boolean;
  createdAt: string;
  doneAt: string;
};

export type OutreachStatus = "draft" | "sent" | "replied" | "dropped";

export type Outreach = {
  id: number;
  companyId: number;
  company: string;
  jobId: number | null;
  code: string | null;
  jobTitle: string | null;
  contactId: number | null;
  contactName: string | null;
  contactTitle: string | null;
  contactLinkedin: string | null;
  contactEmail: string | null;
  channel: string;
  subject: string;
  body: string;
  status: OutreachStatus;
  createdOn: string;
  sentOn: string;
  followUpOn: string;
  source: string;
};

export type Interview = {
  id: number;
  jobId: number;
  code: string;
  jobTitle: string;
  url: string;
  companyId: number;
  company: string;
  round: string;
  scheduledOn: string;
  withWhom: string;
  format: string;
  prep: string;
  notes: string;
  outcome: "pending" | "passed" | "rejected" | "withdrew";
};

export type Offer = {
  id: number;
  jobId: number;
  code: string;
  jobTitle: string;
  company: string;
  pay: string;
  schedule: string;
  benefits: string;
  growth: string;
  notes: string;
  decision: "open" | "accepted" | "declined";
  receivedOn: string;
};

export type InterviewsData = { interviews: Interview[]; offers: Offer[] };

export type Funnel = {
  stages: { saved: number; applied: number; replied: number; interviewing: number; offers: number };
  bySource: { source: string; saved: number; applied: number; replied: number }[];
  outreach: { sent: number; replied: number; drafts: number };
};

export type PayTargets = { min: number; ideal: number; currency: "PHP"; per: "month" };

export type LearningStep = {
  id: number;
  pathId: number;
  title: string;
  notes: string;
  url: string;
  position: number;
  status: "todo" | "doing" | "done";
  doneAt: string;
};

export type LearningPath = {
  id: number;
  title: string;
  goal: string;
  skill: string;
  createdAt: string;
  steps: LearningStep[];
};

export type Preference = {
  id: number;
  kind: "like" | "avoid" | "rule";
  text: string;
  source: string;
  createdAt: string;
};

export type LibraryItem = {
  id: number;
  kind: "text" | "file";
  title: string;
  body: string;
  fileName: string;
  mime: string;
  size: number;
  createdAt: string;
};
