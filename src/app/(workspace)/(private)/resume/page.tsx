"use client";

import { Printer, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { ResumeDocument } from "@/components/resume-document";
import { resume } from "@/data/resume";
import { tailorResume } from "@/lib/tailor";
import {
  APPLICATIONS_KEY,
  SKILLS_KEY,
  newId,
  type Application,
  type Skill,
} from "@/lib/tracker";
import { useLocalStorage } from "@/lib/use-local-storage";

export default function ResumePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [saved, setSaved] = useState(false);
  const [, setApplications] = useLocalStorage<Application[]>(APPLICATIONS_KEY, []);
  const [skills] = useLocalStorage<Skill[]>(SKILLS_KEY, []);

  const result = useMemo(
    () => (jobDescription.trim() ? tailorResume(resume, jobDescription) : null),
    [jobDescription],
  );

  const known = new Set(skills.filter((skill) => skill.status === "know").map((s) => s.name.toLowerCase()));
  const learning = new Set(
    skills.filter((skill) => skill.status !== "know").map((s) => s.name.toLowerCase()),
  );

  function saveApplication() {
    setApplications((previous) => [
      {
        id: newId(),
        company: company.trim() || "Unknown company",
        role: role.trim() || "Unknown role",
        status: "Saved",
        url: "",
        appliedOn: "",
        notes: "",
        jobDescription,
        matchPercent: result?.matchPercent ?? null,
        createdAt: new Date().toISOString(),
      },
      ...previous,
    ]);
    setSaved(true);
  }

  return (
    <>
      <div className="workspace-panel no-print">
        <h1>Resume</h1>
        <p className="muted">
          Paste a job description to reorder your resume toward it. Nothing is invented: bullets
          and skills are only re-ranked from the source data.
        </p>
        <div className="form-row">
          <label>
            Company
            <input value={company} onChange={(event) => setCompany(event.target.value)} />
          </label>
          <label>
            Role
            <input value={role} onChange={(event) => setRole(event.target.value)} />
          </label>
        </div>
        <label>
          Job description
          <textarea
            onChange={(event) => {
              setJobDescription(event.target.value);
              setSaved(false);
            }}
            placeholder="Paste the job description here"
            rows={8}
            value={jobDescription}
          />
        </label>

        {result ? (
          <div className="match-report">
            <p>
              <strong>
                {result.matchPercent === null
                  ? "No known technologies detected in this description."
                  : `${result.matchPercent}% of detected keywords are on your resume`}
              </strong>
            </p>
            {result.matched.length > 0 ? (
              <p>
                <span className="muted">On resume: </span>
                {result.matched.map((term) => (
                  <span className="chip good" key={term}>
                    {term}
                  </span>
                ))}
              </p>
            ) : null}
            {result.missing.length > 0 ? (
              <p>
                <span className="muted">Missing: </span>
                {result.missing.map((term) => {
                  const key = term.toLowerCase();
                  const hint = known.has(key)
                    ? " (marked as known; consider adding)"
                    : learning.has(key)
                      ? " (on your learning list)"
                      : "";
                  return (
                    <span className="chip warn" key={term}>
                      {term}
                      {hint}
                    </span>
                  );
                })}
              </p>
            ) : null}
            <div className="action-row">
              <button className="icon-button" onClick={() => window.print()} type="button">
                <Printer aria-hidden="true" size={16} />
                Print / save PDF
              </button>
              <button
                className="icon-button"
                disabled={saved}
                onClick={saveApplication}
                type="button"
              >
                <Save aria-hidden="true" size={16} />
                {saved ? "Saved to applications" : "Save as application"}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="resume-preview">
        <ResumeDocument resume={result?.resume ?? resume} />
      </div>
    </>
  );
}
