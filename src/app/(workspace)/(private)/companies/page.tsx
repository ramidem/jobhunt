"use client";

import { ExternalLink, Globe, Mail, MessageSquarePlus, Pencil, Phone, Search, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogContactSheet } from "@/components/workspace/log-contact-sheet";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { api, useResource, type Company, type CompanyKind } from "@/lib/api";
import { formatDay } from "@/lib/format";

const KIND_LABEL: Record<CompanyKind, string> = {
  employer: "Employer",
  agency: "Staffing agency",
  confidential: "Confidential employer",
  unknown: "Not checked",
};

function EditCompanySheet({ company, onSaved }: { company: Company; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState({
    name: company.name,
    website: company.website,
    careersUrl: company.careersUrl,
    linkedinUrl: company.linkedinUrl,
    kind: company.kind,
    notes: company.notes,
  });
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api(`companies/${company.id}`, { method: "PATCH", body: { ...fields, enriched: true } });
      setError(null);
      setOpen(false);
      onSaved();
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  const text = (key: "name" | "website" | "careersUrl" | "linkedinUrl" | "notes", label: string, type = "text") => (
    <div className="grid gap-1.5">
      <Label htmlFor={`co-${company.id}-${key}`}>{label}</Label>
      <Input
        id={`co-${company.id}-${key}`}
        onChange={(event) => setFields({ ...fields, [key]: event.target.value })}
        required={key === "name"}
        type={type}
        value={fields[key]}
      />
    </div>
  );

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button aria-label={`Edit ${company.name}`} size="icon" variant="ghost">
          <Pencil aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="mx-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-xl pb-[env(safe-area-inset-bottom)]"
        side="bottom"
      >
        <form onSubmit={save}>
          <SheetHeader>
            <SheetTitle>Edit company</SheetTitle>
            <SheetDescription>{company.legalName || company.name}</SheetDescription>
          </SheetHeader>
          <div className="grid gap-3 px-4">
            {text("name", "Name")}
            {text("website", "Website", "url")}
            {text("careersUrl", "Careers or jobs page", "url")}
            {text("linkedinUrl", "LinkedIn page", "url")}
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select onValueChange={(value) => setFields({ ...fields, kind: value as CompanyKind })} value={fields.kind}>
                <SelectTrigger aria-label="Company type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(KIND_LABEL) as CompanyKind[]).map((value) => (
                    <SelectItem key={value} value={value}>
                      {KIND_LABEL[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {text("notes", "Notes")}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <SheetFooter>
            <Button type="submit">Save</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function AddContactSheet({ company, onSaved }: { company: Company; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState({ name: "", title: "", linkedinUrl: "", email: "", phone: "" });
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api("contacts", { method: "POST", body: { companyId: company.id, ...fields } });
      setFields({ name: "", title: "", linkedinUrl: "", email: "", phone: "" });
      setError(null);
      setOpen(false);
      onSaved();
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  const field = (key: keyof typeof fields, label: string, type = "text") => (
    <div className="grid grid-cols-1 gap-1.5">
      <Label htmlFor={`contact-${key}`}>{label}</Label>
      <Input
        id={`contact-${key}`}
        onChange={(event) => setFields({ ...fields, [key]: event.target.value })}
        required={key === "name"}
        type={type}
        value={fields[key]}
      />
    </div>
  );

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus aria-hidden="true" />
          Add contact
        </Button>
      </SheetTrigger>
      <SheetContent
        className="mx-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-xl pb-[env(safe-area-inset-bottom)]"
        side="bottom"
      >
        <form onSubmit={save}>
          <SheetHeader>
            <SheetTitle>Add contact</SheetTitle>
            <SheetDescription>{company.name}</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-1 gap-3 px-4">
            {field("name", "Name")}
            {field("title", "Title")}
            {field("linkedinUrl", "LinkedIn URL", "url")}
            <div className="grid grid-cols-2 gap-3">
              {field("email", "Email", "email")}
              {field("phone", "Phone", "tel")}
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <SheetFooter>
            <Button type="submit">Save</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default function CompaniesPage() {
  const { data, error, mutate, reload } = useResource<Company[]>("companies");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(30);
  const companies = data ?? [];
  const needle = query.trim().toLowerCase();
  const visible = companies.filter(
    (company) =>
      !needle ||
      company.name.toLowerCase().includes(needle) ||
      company.contacts.some((contact) => contact.name.toLowerCase().includes(needle)) ||
      company.jobs.some((job) => `${job.code} ${job.title}`.toLowerCase().includes(needle)),
  );

  return (
    <PageBody>
      <PageHeader
        title="Companies"
        description="Who's hiring, who you've talked to, and when."
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Search companies or contacts"
          className="bg-background pl-9"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search companies, contacts or job codes"
          type="search"
          value={query}
        />
      </div>

      <ul className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {visible.slice(0, limit).map((company) => (
          <li key={company.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 leading-snug">
                  {company.name}
                  <EditCompanySheet company={company} key={`${company.id}-${company.website}-${company.careersUrl}-${company.kind}`} onSaved={reload} />
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {[company.industry, company.size].filter(Boolean).join(" · ") || "No company details yet"}
                </CardDescription>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm">
                  {company.website ? (
                    <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={company.website} rel="noreferrer" target="_blank">
                      <Globe aria-hidden="true" className="size-3.5" />
                      Website
                    </a>
                  ) : (
                    <span className="text-muted-foreground">No website yet</span>
                  )}
                  {company.careersUrl ? (
                    <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={company.careersUrl} rel="noreferrer" target="_blank">
                      <ExternalLink aria-hidden="true" className="size-3.5" />
                      Careers
                    </a>
                  ) : null}
                  {company.linkedinUrl ? (
                    <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href={company.linkedinUrl} rel="noreferrer" target="_blank">
                      <ExternalLink aria-hidden="true" className="size-3.5" />
                      LinkedIn
                    </a>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {company.kind !== "unknown" ? <Badge variant="outline">{KIND_LABEL[company.kind]}</Badge> : null}
                  <Badge variant="secondary">
                    {company.jobCount} {company.jobCount === 1 ? "posting" : "postings"}
                  </Badge>
                  {company.sources.map((source) => (
                    <Badge key={source} variant="outline">
                      {source}
                    </Badge>
                  ))}
                  <Badge variant={company.lastContactedOn ? "default" : "outline"}>
                    {company.lastContactedOn
                      ? `Last contact ${formatDay(company.lastContactedOn)}`
                      : "Not contacted yet"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                <section className="grid grid-cols-1 gap-2">
                  <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Contacts
                  </h3>
                  {company.contacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No contacts yet.</p>
                  ) : (
                    <ul className="grid grid-cols-1 gap-2">
                      {company.contacts.map((contact) => (
                        <li className="flex items-start gap-2 rounded-lg border p-3" key={contact.id}>
                          <div className="min-w-0 flex-1 text-sm">
                            <p className="font-medium">
                              {contact.linkedinUrl ? (
                                <a className="hover:underline" href={contact.linkedinUrl} rel="noreferrer" target="_blank">
                                  {contact.name}
                                </a>
                              ) : (
                                contact.name
                              )}
                            </p>
                            {contact.title ? (
                              <p className="line-clamp-2 text-muted-foreground">{contact.title}</p>
                            ) : null}
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                              {contact.email ? (
                                <a className="inline-flex items-center gap-1 hover:text-foreground" href={`mailto:${contact.email}`}>
                                  <Mail aria-hidden="true" className="size-3.5" />
                                  {contact.email}
                                </a>
                              ) : null}
                              {contact.phone ? (
                                <a className="inline-flex items-center gap-1 hover:text-foreground" href={`tel:${contact.phone}`}>
                                  <Phone aria-hidden="true" className="size-3.5" />
                                  {contact.phone}
                                </a>
                              ) : null}
                            </div>
                          </div>
                          <Button
                            aria-label={`Remove ${contact.name}`}
                            onClick={() => {
                              if (window.confirm(`Remove ${contact.name}?`)) {
                                void mutate(`contacts/${contact.id}`, "DELETE");
                              }
                            }}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {company.jobs.length > 0 ? (
                  <section className="grid grid-cols-1 gap-2">
                    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Postings
                    </h3>
                    <ul className="grid grid-cols-1 gap-1 text-sm">
                      {company.jobs.map((job) => (
                        <li className="flex items-center justify-between gap-2" key={job.id}>
                          <span className="shrink-0 font-mono text-xs tracking-wider text-muted-foreground">{job.code}</span>
                          {job.url ? (
                            <a className="min-w-0 flex-1 truncate hover:underline" href={job.url} rel="noreferrer" target="_blank">
                              {job.title}
                            </a>
                          ) : (
                            <span className="min-w-0 truncate">{job.title}</span>
                          )}
                          {job.contactIds.length > 0 ? (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {job.contactIds.length} {job.contactIds.length === 1 ? "contact" : "contacts"}
                            </span>
                          ) : null}
                          {job.status ? <Badge variant="outline">{job.status}</Badge> : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {company.log.length > 0 ? (
                  <section className="grid grid-cols-1 gap-2">
                    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Contact history
                    </h3>
                    <ul className="grid grid-cols-1 gap-2 text-sm">
                      {company.log.map((entry) => (
                        <li className="flex items-start gap-2" key={entry.id}>
                          <div className="min-w-0 flex-1">
                            <p>
                              <span className="font-medium">{formatDay(entry.happenedOn)}</span>
                              {" · "}
                              {entry.direction === "out" ? "Reached out" : "They replied"} via {entry.channel}
                              {entry.contactName ? ` · ${entry.contactName}` : ""}
                            </p>
                            {entry.summary ? <p className="text-muted-foreground">{entry.summary}</p> : null}
                            {entry.followUpOn ? (
                              <p className="text-muted-foreground">Follow up {formatDay(entry.followUpOn)}</p>
                            ) : null}
                          </div>
                          <Button
                            aria-label="Delete this entry"
                            onClick={() => void mutate(`contact-log/${entry.id}`, "DELETE")}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <LogContactSheet
                    company={company}
                    contacts={company.contacts}
                    defaultContactId={company.contacts[0]?.id}
                    defaultJobId={company.jobs[0]?.id}
                    jobs={company.jobs}
                    onSaved={reload}
                  >
                    <Button size="sm">
                      <MessageSquarePlus aria-hidden="true" />
                      Log contact
                    </Button>
                  </LogContactSheet>
                  <AddContactSheet company={company} onSaved={reload} />
                </div>
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
