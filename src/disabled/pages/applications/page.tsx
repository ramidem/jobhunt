"use client";

import { ExternalLink, Mail, MessageSquarePlus, Plus, Search, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { JobContactsSheet } from "@/components/workspace/job-contacts-sheet";
import { LogContactSheet } from "@/components/workspace/log-contact-sheet";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { formatDay, formatMonthlyPay } from "@/lib/format";
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
import { useResource, type Application, type PayTargets } from "@/lib/api";
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
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(30);
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [payFilter, setPayFilter] = useState<"any" | "listed" | "min" | "ideal">("any");
  const targets = useResource<PayTargets>("targets").data;

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

  const needle = query.trim().toLowerCase();
  const visibleUnsorted = applications.filter(
    (item) =>
      (filter === "All" || item.status === filter) &&
      (!priorityOnly || item.priority) &&
      (payFilter === "any" ||
        (payFilter === "listed" && item.payMax !== null) ||
        (payFilter === "min" && !item.payHourly && item.payMax !== null && item.payMax >= (targets?.min ?? 80000)) ||
        (payFilter === "ideal" && !item.payHourly && item.payMax !== null && item.payMax >= (targets?.ideal ?? 150000))) &&
      (!needle || `${item.code} ${item.role} ${item.company} ${item.location} ${item.source}`.toLowerCase().includes(needle)),
  );

  const visible =
    payFilter === "any"
      ? visibleUnsorted
      : [...visibleUnsorted].sort((a, b) => (b.payMax ?? 0) - (a.payMax ?? 0));

  return (
    <PageBody>
      <PageHeader
        description="Saved on your Mac and shared across devices."
        title="Applications"
      />

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

      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Search jobs"
          className="bg-background pl-9"
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(30);
          }}
          placeholder="Search code, role, company, location or source"
          type="search"
          value={query}
        />
      </div>

      <div
        aria-label="Filter by status"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
        role="group"
      >
        <Select onValueChange={(value) => setPayFilter(value as typeof payFilter)} value={payFilter}>
          <SelectTrigger aria-label="Filter by pay" className="h-8 w-auto shrink-0 rounded-full px-3 text-sm md:h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any pay</SelectItem>
            <SelectItem value="listed">Pay listed ({applications.filter((item) => item.payMax !== null).length})</SelectItem>
            <SelectItem value="min">
              ₱{Math.round((targets?.min ?? 80000) / 1000)}k+ ({applications.filter((item) => !item.payHourly && item.payMax !== null && item.payMax >= (targets?.min ?? 80000)).length})
            </SelectItem>
            <SelectItem value="ideal">
              ₱{Math.round((targets?.ideal ?? 150000) / 1000)}k+ ({applications.filter((item) => !item.payHourly && item.payMax !== null && item.payMax >= (targets?.ideal ?? 150000)).length})
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          aria-pressed={priorityOnly}
          className="shrink-0 rounded-full"
          onClick={() => setPriorityOnly(!priorityOnly)}
          size="sm"
          type="button"
          variant={priorityOnly ? "default" : "outline"}
        >
          <Star aria-hidden="true" />
          Priority
          <span className={priorityOnly ? "opacity-70" : "text-muted-foreground"}>
            {applications.filter((item) => item.priority).length}
          </span>
        </Button>
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

      <ul className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        {visible.slice(0, limit).map((item) => (
          <li key={item.id}>
            <Card>
              <CardHeader>
                <CardTitle className="leading-snug">
                  <span className="mr-2 inline-block rounded-md border px-1.5 py-0.5 align-middle font-mono text-xs tracking-wider text-muted-foreground">
                    {item.code}
                  </span>
                  {item.role}
                  {!item.payHourly && item.payMax !== null && item.payMax >= (targets?.ideal ?? 150000) ? (
                    <Badge className="ml-2 bg-emerald-600 align-middle text-white">₱{Math.round((targets?.ideal ?? 150000) / 1000)}k+</Badge>
                  ) : !item.payHourly && item.payMax !== null && item.payMax >= (targets?.min ?? 80000) ? (
                    <Badge className="ml-2 align-middle" variant="secondary">₱{Math.round((targets?.min ?? 80000) / 1000)}k+</Badge>
                  ) : null}
                  {item.priority ? (
                    <Star aria-label="Priority" className="ml-1.5 inline size-4 fill-amber-400 text-amber-500" />
                  ) : null}
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{item.company}</span>
                  {[item.location, item.workType, item.employmentType].filter(Boolean).length > 0 ? (
                    <span>{[item.location, item.workType, item.employmentType].filter(Boolean).join(" · ")}</span>
                  ) : null}
                  {item.matchPercent !== null ? (
                    <Badge variant="secondary">{item.matchPercent}% match</Badge>
                  ) : null}
                </CardDescription>
                <CardAction className="flex">
                  <Button
                    aria-label={item.priority ? `Remove ${item.role} from priority` : `Mark ${item.role} as priority`}
                    aria-pressed={item.priority}
                    onClick={() =>
                      void mutate("job-priority", "PATCH", { code: item.code, priority: !item.priority })
                    }
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Star aria-hidden="true" className={item.priority ? "fill-amber-400 text-amber-500" : ""} />
                  </Button>
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
                      ["Pay", item.payMax !== null ? `${item.salary}${item.payHourly ? " (hourly)" : /php|₱/i.test(item.salary) ? "" : ` (≈ ${formatMonthlyPay(item.payMin, item.payMax)})`}` : item.salary],
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
                <div className="grid gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium">{item.company}</span>
                    {item.companyKind === "agency" ? <Badge variant="outline">Staffing agency</Badge> : null}
                    {item.companyWebsite ? (
                      <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={item.companyWebsite} rel="noreferrer" target="_blank">
                        Website
                        <ExternalLink aria-hidden="true" className="size-3" />
                      </a>
                    ) : null}
                    {item.companyCareers ? (
                      <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={item.companyCareers} rel="noreferrer" target="_blank">
                        Careers
                        <ExternalLink aria-hidden="true" className="size-3" />
                      </a>
                    ) : null}
                    {item.companyLinkedin ? (
                      <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={item.companyLinkedin} rel="noreferrer" target="_blank">
                        LinkedIn
                        <ExternalLink aria-hidden="true" className="size-3" />
                      </a>
                    ) : null}
                  </div>
                  {item.clientNote ? <p className="text-muted-foreground">Client: {item.clientNote}</p> : null}
                  {item.companyBrief ? <p className="line-clamp-3 text-muted-foreground">{item.companyBrief}</p> : null}
                  {item.contacts.length === 0 ? (
                    <p className="text-muted-foreground">
                      No hiring contact yet
                      {item.companyContacts.length > 0 ? ` · ${item.companyContacts.length} known at the company` : ""}
                    </p>
                  ) : (
                    <ul className="grid gap-1">
                      {item.contacts.map((contact) => (
                        <li key={contact.id}>
                          {contact.linkedinUrl ? (
                            <a className="font-medium hover:underline" href={contact.linkedinUrl} rel="noreferrer" target="_blank">
                              {contact.name}
                            </a>
                          ) : (
                            <span className="font-medium">{contact.name}</span>
                          )}
                          {contact.title ? (
                            <span className="text-muted-foreground"> · {contact.title.split("|")[0].trim()}</span>
                          ) : null}
                          {contact.email ? (
                            <a className="ml-2 inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={`mailto:${contact.email}`}>
                              <Mail aria-hidden="true" className="size-3.5" />
                              {contact.email}
                            </a>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {item.lastContactedOn ? `Last contact ${formatDay(item.lastContactedOn)}` : "Not contacted yet"}
                    </p>
                    <div className="flex gap-2">
                      <JobContactsSheet
                        attached={item.contacts}
                        company={{ id: item.companyId, name: item.company }}
                        companyContacts={item.companyContacts}
                        job={{ id: item.jobId, title: item.role, code: item.code }}
                        onChanged={reload}
                      />
                      <LogContactSheet
                        company={{ id: item.companyId, name: item.company }}
                        contacts={item.contacts.map((contact) => ({ id: contact.id, name: contact.name }))}
                        defaultContactId={item.contacts[0]?.id}
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
                  </div>
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
                        {item.url.includes("mail.google.com") ? "Open source email" : "View posting"}
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
      {visible.length > limit ? (
        <Button className="self-center" onClick={() => setLimit(limit + 30)} variant="outline">
          Show more ({visible.length - limit} left)
        </Button>
      ) : null}
    </PageBody>
  );
}
