"use client";

import { Printer, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { ResumeDocument } from "@/components/resume-document";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resume } from "@/data/resume";
import { tailorResume } from "@/lib/tailor";
import { api, useResource, type Skill } from "@/lib/api";

export default function ResumePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const skills = useResource<Skill[]>("skills").data ?? [];

  const result = useMemo(
    () => (jobDescription.trim() ? tailorResume(resume, jobDescription) : null),
    [jobDescription],
  );

  const known = new Set(skills.filter((skill) => skill.status === "know").map((s) => s.name.toLowerCase()));
  const learning = new Set(
    skills.filter((skill) => skill.status !== "know").map((s) => s.name.toLowerCase()),
  );

  async function saveApplication() {
    try {
      await api("applications", {
        method: "POST",
        body: {
          company: company.trim() || "Unknown company",
          role: role.trim() || "Unknown role",
          jobDescription,
          skills: result ? [...result.matched, ...result.missing] : [],
        },
      });
      setSaved(true);
      setSaveError(null);
    } catch (reason) {
      setSaveError((reason as Error).message);
    }
  }

  return (
    <>
      <PageBody>
        <PageHeader
          title="Tailor resume"
          description="Paste a job description to reorder your resume toward it. Nothing is invented: bullets and skills are only re-ranked from the source data."
        />
        <Card>
          <CardContent className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="tailor-company">Company</Label>
                <Input
                  id="tailor-company"
                  onChange={(event) => setCompany(event.target.value)}
                  value={company}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="tailor-role">Role</Label>
                <Input id="tailor-role" onChange={(event) => setRole(event.target.value)} value={role} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tailor-jd">Job description</Label>
              <Textarea
                className="min-h-40"
                id="tailor-jd"
                onChange={(event) => {
                  setJobDescription(event.target.value);
                  setSaved(false);
                }}
                placeholder="Paste the job description here"
                value={jobDescription}
              />
            </div>
          </CardContent>
        </Card>

        {result ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {result.matchPercent === null
                  ? "No known technologies detected in this description."
                  : `${result.matchPercent}% of detected keywords are on your resume`}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {result.matched.length > 0 ? (
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">On resume</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matched.map((term) => (
                      <Badge
                        className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                        key={term}
                        variant="secondary"
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {result.missing.length > 0 ? (
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">Missing</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missing.map((term) => {
                      const key = term.toLowerCase();
                      const hint = known.has(key)
                        ? " · marked known, consider adding"
                        : learning.has(key)
                          ? " · on your learning list"
                          : "";
                      return (
                        <Badge
                          className="h-auto bg-amber-50 whitespace-normal text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                          key={term}
                          variant="secondary"
                        >
                          {term}
                          {hint}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
              <div className="grid gap-2 sm:flex">
                <Button onClick={() => window.print()} type="button" variant="outline">
                  <Printer aria-hidden="true" />
                  Print / save PDF
                </Button>
                <Button disabled={saved} onClick={() => void saveApplication()} type="button">
                  <Save aria-hidden="true" />
                  {saved ? "Saved to applications" : "Save as application"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </PageBody>

      <div className="overflow-x-auto px-4 pb-10 md:px-8 print:overflow-visible print:p-0">
        <ResumeDocument resume={result?.resume ?? resume} />
      </div>
    </>
  );
}
