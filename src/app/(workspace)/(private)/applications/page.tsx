"use client";

import { ExternalLink, Mail, MessageSquarePlus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { LogContactSheet } from "@/components/workspace/log-contact-sheet";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { formatDay } from "@/lib/format";
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
import { cn } from "@/lib/utils";
import { useResource, type Application } from "@/lib/api";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/tracker";

// Saves on blur so typing doesn't send a request per keystroke.
function NotesField({ id, value, onSave }: { id: string; value: string; onSave: (next: string) => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <Textarea
      className="min-h-16"
      id={id}
      onBlur={() => draft !== value && onSave(draft)}
      onChange={(event) => setDraft(event.target.value)}
      rows={2}
      value={draft}
    />
  );
}

export default function ApplicationsPage() {
  const { data, error, mutate, reload } = useResource<Application[]>("applications");
  const applications = data ?? [];
  const ready = data !== null;
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [filter, setFilter] = useState<ApplicationStatus | "All">("All");

  function add(event: React.FormEvent) {
    event.preventDefault();
    if (!company.trim() || !role.trim()) {
      return;
    }
    void mutate("applications", "POST", { company, role, url });
    setCompany("");
    setRole("");
    setUrl("");
  }

  function patch(id: number, changes: Partial<Pick<Application, "status" | "appliedOn" | "notes">>) {
    void mutate(`applications/${id}`, "PATCH", changes);
  }

  const visible = applications.filter((item) => filter === "All" || item.status === filter);

  return (
    <PageBody>
      <PageHeader title="Applications" description="Saved on your Mac and shared across devices." />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardContent>
          <form
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_auto] lg:items-end"
            onSubmit={add}
          >
            <div className="grid grid-cols-1 gap-1.5">
              <Label htmlFor="new-company">Company</Label>
              <Input
                id="new-company"
                onChange={(event) => setCompany(event.target.value)}
                required
                value={company}
              />
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <Label htmlFor="new-role">Role</Label>
              <Input
                id="new-role"
                onChange={(event) => setRole(event.target.value)}
                required
                value={role}
              />
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:col-span-2 lg:col-span-1">
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

      <ul className="grid grid-cols-1 gap-4">
        {visible.map((item) => (
          <li key={item.id}>
            <Card>
              <CardHeader>
                <CardTitle className="leading-snug">{item.role}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{item.company}</span>
                  {[item.location, item.workType, item.employmentType].filter(Boolean).length > 0 ? (
                    <span>{[item.location, item.workType, item.employmentType].filter(Boolean).join(" · ")}</span>
                  ) : null}
                  {item.matchPercent !== null ? (
                    <Badge variant="secondary">{item.matchPercent}% match</Badge>
                  ) : null}
                </CardDescription>
                <CardAction>
                  <Button
                    aria-label={`Delete ${item.role} at ${item.company}`}
                    onClick={() => {
                      if (window.confirm(`Delete ${item.role} at ${item.company}?`)) {
                        void mutate(`applications/${item.id}`, "DELETE");
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
              <CardContent className="grid grid-cols-1 gap-3">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                  {(
                    [
                      ["Posted", item.postedOn ? formatDay(item.postedOn) : ""],
                      ["Applicants", item.applicants.replace(/people clicked apply/, "clicked apply")],
                      ["Pay", item.salary],
                      ["Source", item.source],
                    ] as const
                  )
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div className="min-w-0" key={label}>
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="truncate" title={value}>
                          {value}
                        </dd>
                      </div>
                    ))}
                </dl>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="min-w-0">
                    {item.contactName ? (
                      <p>
                        {item.contactLinkedin ? (
                          <a className="font-medium hover:underline" href={item.contactLinkedin} rel="noreferrer" target="_blank">
                            {item.contactName}
                          </a>
                        ) : (
                          <span className="font-medium">{item.contactName}</span>
                        )}
                        {item.contactTitle ? (
                          <span className="text-muted-foreground"> · {item.contactTitle.split("|")[0].trim()}</span>
                        ) : null}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">No hiring contact listed</p>
                    )}
                    {item.contactEmail ? (
                      <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={`mailto:${item.contactEmail}`}>
                        <Mail aria-hidden="true" className="size-3.5" />
                        {item.contactEmail}
                      </a>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      {item.lastContactedOn ? `Last contact ${formatDay(item.lastContactedOn)}` : "Not contacted yet"}
                    </p>
                  </div>
                  <LogContactSheet
                    company={{ id: item.companyId, name: item.company }}
                    contacts={item.contactId && item.contactName ? [{ id: item.contactId, name: item.contactName }] : []}
                    defaultContactId={item.contactId}
                    defaultJobId={item.jobId}
                    jobs={[{ id: item.jobId, title: item.role }]}
                    onSaved={reload}
                  >
                    <Button size="sm" variant="outline">
                      <MessageSquarePlus aria-hidden="true" />
                      Log contact
                    </Button>
                  </LogContactSheet>
                </div>
                {item.skills.some((skill) => skill.status !== "know") ? (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">Missing:</span>
                    {item.skills
                      .filter((skill) => skill.status !== "know")
                      .map((skill) => (
                        <Badge
                          className="bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                          key={skill.name}
                          variant="secondary"
                        >
                          {skill.name}
                        </Badge>
                      ))}
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-[10rem_11rem_1fr] sm:items-end">
                  <div className="grid grid-cols-1 gap-1.5">
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
                  <div className="grid grid-cols-1 gap-1.5">
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
                <div className="grid grid-cols-1 gap-1.5">
                  <Label htmlFor={`notes-${item.id}`}>Notes</Label>
                  <NotesField
                    id={`notes-${item.id}`}
                    onSave={(notes) => patch(item.id, { notes })}
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
