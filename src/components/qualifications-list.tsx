"use client";

import { Eye, EyeOff, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { useResource, type QualificationLine, type Qualifications } from "@/lib/api";
import { cn } from "@/lib/utils";

// Each line's text is stored once, so hiding "Degree" hides it in every role.
export function QualificationsList() {
  const { data, error, mutate } = useResource<Qualifications>("qualifications");
  const [query, setQuery] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const roles = data?.roles ?? [];
  const hiddenCount = new Set(
    roles.flatMap((role) => role.lines.filter((line) => line.hidden).map((line) => line.id)),
  ).size;
  const needle = query.trim().toLowerCase();
  const visible = roles.filter(
    (role) =>
      !needle ||
      role.title.toLowerCase().includes(needle) ||
      role.lines.some((line) => line.text.toLowerCase().includes(needle)),
  );

  function toggle(line: QualificationLine) {
    void mutate(`qualification-lines/${line.id}`, "PATCH", { hidden: !line.hidden });
  }

  return (
    <PageBody>
      <PageHeader
        title="Qualifications"
        description={data ? `${data.note} Source: ${data.source}.` : undefined}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
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
            {visible.length} of {roles.length} roles
            {hiddenCount > 0 ? ` · ${hiddenCount} hidden ${hiddenCount === 1 ? "line" : "lines"}` : ""}
          </p>
          {hiddenCount > 0 ? (
            <div className="flex items-center gap-2">
              <Switch checked={showHidden} id="show-hidden" onCheckedChange={setShowHidden} />
              <Label htmlFor="show-hidden">Show hidden</Label>
            </div>
          ) : null}
        </div>
      </div>
      <ul className="grid gap-4">
        {visible.map((role) => {
          const lines = role.lines.filter((line) => showHidden || !line.hidden);
          return (
            <li key={role.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="leading-snug">{role.title}</CardTitle>
                  {role.updated ? <CardDescription>Updated {role.updated}</CardDescription> : null}
                </CardHeader>
                <CardContent>
                  {lines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">All qualifications hidden.</p>
                  ) : null}
                  <ul className="-my-1 text-sm">
                    {lines.map((line) => {
                      const isHidden = line.hidden;
                      return (
                        <li className="flex items-start gap-2" key={line.id}>
                          <span
                            className={cn(
                              "flex-1 py-2 md:py-1.5",
                              isHidden && "text-muted-foreground line-through",
                            )}
                          >
                            {line.text}
                          </span>
                          <Button
                            aria-label={isHidden ? `Show “${line.text}”` : `Hide “${line.text}”, I don't need it`}
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
    </PageBody>
  );
}
