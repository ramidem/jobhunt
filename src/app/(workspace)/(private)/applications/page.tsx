"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  APPLICATIONS_KEY,
  APPLICATION_STATUSES,
  newId,
  type Application,
  type ApplicationStatus,
} from "@/lib/tracker";
import { useLocalStorage } from "@/lib/use-local-storage";

export default function ApplicationsPage() {
  const [applications, setApplications, ready] = useLocalStorage<Application[]>(
    APPLICATIONS_KEY,
    [],
  );
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [filter, setFilter] = useState<ApplicationStatus | "All">("All");

  function add(event: React.FormEvent) {
    event.preventDefault();
    if (!company.trim() || !role.trim()) {
      return;
    }
    setApplications((previous) => [
      {
        id: newId(),
        company: company.trim(),
        role: role.trim(),
        status: "Saved",
        url: url.trim(),
        appliedOn: "",
        notes: "",
        jobDescription: "",
        matchPercent: null,
        createdAt: new Date().toISOString(),
      },
      ...previous,
    ]);
    setCompany("");
    setRole("");
    setUrl("");
  }

  function patch(id: string, changes: Partial<Application>) {
    setApplications((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }

  const visible = applications.filter((item) => filter === "All" || item.status === filter);

  return (
    <div className="workspace-panel">
      <h1>Applications</h1>
      <p className="muted">Stored in this browser only (localStorage).</p>

      <form className="form-row" onSubmit={add}>
        <label>
          Company
          <input onChange={(event) => setCompany(event.target.value)} required value={company} />
        </label>
        <label>
          Role
          <input onChange={(event) => setRole(event.target.value)} required value={role} />
        </label>
        <label>
          Posting URL
          <input onChange={(event) => setUrl(event.target.value)} type="url" value={url} />
        </label>
        <button className="icon-button primary add-button" type="submit">
          Add
        </button>
      </form>

      <div className="chip-row" role="group" aria-label="Filter by status">
        {(["All", ...APPLICATION_STATUSES] as const).map((status) => (
          <button
            aria-pressed={filter === status}
            className="chip filter"
            key={status}
            onClick={() => setFilter(status)}
            type="button"
          >
            {status}
            {status === "All"
              ? ` (${applications.length})`
              : ` (${applications.filter((item) => item.status === status).length})`}
          </button>
        ))}
      </div>

      {ready && visible.length === 0 ? <p className="muted">No applications yet.</p> : null}

      <ul className="card-list">
        {visible.map((item) => (
          <li className="card" key={item.id}>
            <div className="card-head">
              <div>
                <h2>{item.role}</h2>
                <p>
                  {item.company}
                  {item.matchPercent !== null ? ` · ${item.matchPercent}% keyword match` : ""}
                  {item.url ? (
                    <>
                      {" · "}
                      <a href={item.url} rel="noreferrer" target="_blank">
                        posting
                      </a>
                    </>
                  ) : null}
                </p>
              </div>
              <select
                aria-label="Status"
                onChange={(event) =>
                  patch(item.id, {
                    status: event.target.value as ApplicationStatus,
                    appliedOn:
                      event.target.value === "Applied" && !item.appliedOn
                        ? new Date().toISOString().slice(0, 10)
                        : item.appliedOn,
                  })
                }
                value={item.status}
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <button
                aria-label={`Delete ${item.role} at ${item.company}`}
                className="icon-button"
                onClick={() => {
                  if (window.confirm(`Delete ${item.role} at ${item.company}?`)) {
                    setApplications((previous) => previous.filter((entry) => entry.id !== item.id));
                  }
                }}
                type="button"
              >
                <Trash2 aria-hidden="true" size={16} />
              </button>
            </div>
            <div className="form-row">
              <label>
                Applied on
                <input
                  onChange={(event) => patch(item.id, { appliedOn: event.target.value })}
                  type="date"
                  value={item.appliedOn}
                />
              </label>
              <label className="grow">
                Notes
                <input
                  onChange={(event) => patch(item.id, { notes: event.target.value })}
                  value={item.notes}
                />
              </label>
            </div>
            {item.jobDescription ? (
              <details>
                <summary>Job description</summary>
                <pre>{item.jobDescription}</pre>
              </details>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
