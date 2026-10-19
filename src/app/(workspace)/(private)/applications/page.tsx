"use client";

import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobLeads } from "@/data/job-leads";
import { cn } from "@/lib/utils";
import {
  APPLICATIONS_KEY,
  APPLICATION_STATUSES,
  newId,
  takeUnseeded,
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

  // Add saved job leads this browser hasn't seen yet.
  useEffect(() => {
    if (!ready) {
      return;
    }
    const fresh = takeUnseeded(jobLeads);
    if (fresh.length > 0) {
      setApplications((previous) => [
        ...previous,
        ...fresh.filter((lead) => !previous.some((item) => item.id === lead.id)),
      ]);
    }
  }, [ready, setApplications]);

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
    <PageBody>
      <PageHeader title="Applications" description="Stored in this browser only." />

      <Card>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_auto] lg:items-end"
            onSubmit={add}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="new-company">Company</Label>
              <Input
                id="new-company"
                onChange={(event) => setCompany(event.target.value)}
                required
                value={company}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-role">Role</Label>
              <Input
                id="new-role"
                onChange={(event) => setRole(event.target.value)}
                required
                value={role}
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="new-url">Posting URL</Label>
              <Input
                id="new-url"
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://"
                type="url"
                value={url}
              />
            </div>
            <Button className="sm:col-span-2 lg:col-span-1" type="submit">
              <Plus aria-hidden="true" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <div
        aria-label="Filter by status"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
        role="group"
      >
        {(["All", ...APPLICATION_STATUSES] as const).map((status) => {
          const count =
            status === "All"
              ? applications.length
              : applications.filter((item) => item.status === status).length;
          return (
            <Button
              aria-pressed={filter === status}
              className="shrink-0 rounded-full"
              key={status}
              onClick={() => setFilter(status)}
              size="sm"
              type="button"
              variant={filter === status ? "default" : "outline"}
            >
              {status}
              <span className={cn("tabular-nums", filter === status ? "opacity-70" : "text-muted-foreground")}>
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      {ready && visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No applications here yet.</p>
      ) : null}

      <ul className="grid gap-4">
        {visible.map((item) => (
          <li key={item.id}>
            <Card>
              <CardHeader>
                <CardTitle className="leading-snug">{item.role}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{item.company}</span>
                  {item.matchPercent !== null ? (
                    <Badge variant="secondary">{item.matchPercent}% match</Badge>
                  ) : null}
                </CardDescription>
                <CardAction>
                  <Button
                    aria-label={`Delete ${item.role} at ${item.company}`}
                    onClick={() => {
                      if (window.confirm(`Delete ${item.role} at ${item.company}?`)) {
                        setApplications((previous) =>
                          previous.filter((entry) => entry.id !== item.id),
                        );
                      }
                    }}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-[10rem_11rem_1fr] sm:items-end">
                  <div className="grid gap-1.5">
                    <Label>Status</Label>
                    <Select
                      onValueChange={(value) =>
                        patch(item.id, {
                          status: value as ApplicationStatus,
                          appliedOn:
                            value === "Applied" && !item.appliedOn
                              ? new Date().toISOString().slice(0, 10)
                              : item.appliedOn,
                        })
                      }
                      value={item.status}
                    >
                      <SelectTrigger aria-label="Status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`applied-${item.id}`}>Applied on</Label>
                    <Input
                      id={`applied-${item.id}`}
                      onChange={(event) => patch(item.id, { appliedOn: event.target.value })}
                      type="date"
                      value={item.appliedOn}
                    />
                  </div>
                  {item.url ? (
                    <Button asChild className="col-span-2 sm:col-span-1 sm:justify-self-end" variant="outline">
                      <a href={item.url} rel="noreferrer" target="_blank">
                        View posting
                        <ExternalLink aria-hidden="true" />
                      </a>
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor={`notes-${item.id}`}>Notes</Label>
                  <Textarea
                    className="min-h-16"
                    id={`notes-${item.id}`}
                    onChange={(event) => patch(item.id, { notes: event.target.value })}
                    rows={2}
                    value={item.notes}
                  />
                </div>
                {item.jobDescription ? (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground">Job description</summary>
                    <pre className="mt-2 font-sans whitespace-pre-wrap">{item.jobDescription}</pre>
                  </details>
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </PageBody>
  );
}
