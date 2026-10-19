"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApplicationStatus, SkillStatus } from "@/lib/tracker";

export type JobSkill = { name: string; status: SkillStatus };

export type Application = {
  id: number;
  jobId: number;
  company: string;
  role: string;
  url: string;
  source: string;
  details: string;
  jobDescription: string;
  createdAt: string;
  status: ApplicationStatus;
  appliedOn: string;
  notes: string;
  skills: JobSkill[];
  matchPercent: number | null;
};

export type Skill = { id: number; name: string; status: SkillStatus; demand: number };

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
