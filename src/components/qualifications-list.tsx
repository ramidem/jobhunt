"use client";

import { useState } from "react";

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
      <label>
        Search roles or qualifications
        <input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. Python, Kubernetes, Data Engineer"
          type="search"
          value={query}
        />
      </label>
      <p className="muted">
        {visible.length} of {jobs.length} roles
      </p>
      <ul className="card-list">
        {visible.map((job, index) => (
          <li className="card" key={`${job.title}-${index}`}>
            <div className="card-head">
              <h2>{job.title}</h2>
              {job.updated ? <span className="muted">updated {job.updated}</span> : null}
            </div>
            <ul className="plain-list">
              {job.qualifications.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}
