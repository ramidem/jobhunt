"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApplicationStatus, SkillStatus } from "@/lib/tracker";

export type JobSkill = { name: string; status: SkillStatus };

export type Application = {
  id: number;
  jobId: number;
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
  postedOn: string;
  applicants: string;
  jobDescription: string;
  contactId: number | null;
  contactName: string | null;
  contactTitle: string | null;
  contactLinkedin: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  lastContactedOn: string | null;
  createdAt: string;
  status: ApplicationStatus;
  appliedOn: string;
  notes: string;
  skills: JobSkill[];
  matchPercent: number | null;
};

export type Skill = { id: number; name: string; status: SkillStatus; demand: number };

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
  jobs: { id: number; title: string; url: string; applicationId: number | null; status: ApplicationStatus | null }[];
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

export type QualificationLine = { id: number; text: string; hidden: boolean };
export type QualificationRole = {
  id: number;
  title: string;
  updated: string | null;
  lines: QualificationLine[];
};
export type Qualifications = { source: string; note: string; roles: QualificationRole[] };

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
