"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Job = { title: string; qualifications: string[]; updated: string | null };

export function QualificationsList({ jobs }: { jobs: Job[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = jobs.filter(
    (job) =>
      !needle ||
      job.title.toLowerCase().includes(needle) ||
      job.qualifications.some((line) => line.toLowerCase().includes(needle)),
  );

  return (
    <>
      <div className="grid gap-2">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search roles or qualifications"
            className="bg-background pl-9"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search, e.g. Python, Kubernetes, Data Engineer"
            type="search"
            value={query}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {visible.length} of {jobs.length} roles
        </p>
      </div>
      <ul className="grid gap-4">
        {visible.map((job, index) => (
          <li key={`${job.title}-${index}`}>
            <Card>
              <CardHeader>
                <CardTitle className="leading-snug">{job.title}</CardTitle>
                {job.updated ? <CardDescription>Updated {job.updated}</CardDescription> : null}
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1.5 pl-5 text-sm">
                  {job.qualifications.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
