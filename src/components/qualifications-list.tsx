"use client";

import { Eye, EyeOff, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { HIDDEN_QUALIFICATIONS_KEY } from "@/lib/tracker";
import { useLocalStorage } from "@/lib/use-local-storage";
import { cn } from "@/lib/utils";

type Job = { title: string; qualifications: string[]; updated: string | null };

// Hiding works on the line's text, so hiding "Degree" hides it in every role.
const normalize = (line: string) => line.trim().toLowerCase();

export function QualificationsList({ jobs }: { jobs: Job[] }) {
  const [query, setQuery] = useState("");
  const [hidden, setHidden] = useLocalStorage<string[]>(HIDDEN_QUALIFICATIONS_KEY, []);
  const [showHidden, setShowHidden] = useState(false);
  const hiddenSet = new Set(hidden);
  const needle = query.trim().toLowerCase();
  const visible = jobs.filter(
    (job) =>
      !needle ||
      job.title.toLowerCase().includes(needle) ||
      job.qualifications.some((line) => line.toLowerCase().includes(needle)),
  );

  function toggle(line: string) {
    const key = normalize(line);
    setHidden((previous) =>
      previous.includes(key) ? previous.filter((entry) => entry !== key) : [...previous, key],
    );
  }

  return (
    <>
      <div className="grid gap-3">
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {visible.length} of {jobs.length} roles
            {hidden.length > 0 ? ` · ${hidden.length} hidden ${hidden.length === 1 ? "line" : "lines"}` : ""}
          </p>
          {hidden.length > 0 ? (
            <div className="flex items-center gap-2">
              <Switch checked={showHidden} id="show-hidden" onCheckedChange={setShowHidden} />
              <Label htmlFor="show-hidden">Show hidden</Label>
            </div>
          ) : null}
        </div>
      </div>
      <ul className="grid gap-4">
        {visible.map((job, index) => {
          const lines = job.qualifications.filter(
            (line) => showHidden || !hiddenSet.has(normalize(line)),
          );
          return (
            <li key={`${job.title}-${index}`}>
              <Card>
                <CardHeader>
                  <CardTitle className="leading-snug">{job.title}</CardTitle>
                  {job.updated ? <CardDescription>Updated {job.updated}</CardDescription> : null}
                </CardHeader>
                <CardContent>
                  {lines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">All qualifications hidden.</p>
                  ) : null}
                  <ul className="-my-1 text-sm">
                    {lines.map((line) => {
                      const isHidden = hiddenSet.has(normalize(line));
                      return (
                        <li className="flex items-start gap-2" key={line}>
                          <span
                            className={cn(
                              "flex-1 py-2 md:py-1.5",
                              isHidden && "text-muted-foreground line-through",
                            )}
                          >
                            {line}
                          </span>
                          <Button
                            aria-label={isHidden ? `Show “${line}”` : `Hide “${line}”, I don't need it`}
                            aria-pressed={isHidden}
                            className="shrink-0 text-muted-foreground"
                            onClick={() => toggle(line)}
                            size="icon"
                            title={isHidden ? "Show again" : "Hide: I don't need this"}
                            type="button"
                            variant="ghost"
                          >
                            {isHidden ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
}
