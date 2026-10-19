"use client";

import { Check, Copy, ExternalLink, Mail, Plus, Reply, Send, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { api, useResource, type Company, type Outreach } from "@/lib/api";
import { formatDay } from "@/lib/format";

const CHANNELS = ["LinkedIn", "Email", "Other"];

function NewDraftSheet({ onSaved }: { onSaved: () => void }) {
  const companies = useResource<Company[]>("companies");
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [contactId, setContactId] = useState("none");
  const [jobId, setJobId] = useState("none");
  const [channel, setChannel] = useState("LinkedIn");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const list = (companies.data ?? []).filter((company) => company.priority || company.contacts.length > 0);
  const company = list.find((entry) => String(entry.id) === companyId);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api("outreach", {
        method: "POST",
        body: {
          companyId: Number(companyId),
          contactId: contactId === "none" ? undefined : Number(contactId),
          jobId: jobId === "none" ? undefined : Number(jobId),
          channel,
          subject,
          body,
        },
      });
      setBody("");
      setSubject("");
      setError(null);
      setOpen(false);
      onSaved();
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          New draft
        </Button>
      </SheetTrigger>
      <SheetContent
        className="mx-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-xl pb-[env(safe-area-inset-bottom)]"
        side="bottom"
      >
        <form onSubmit={save}>
          <SheetHeader>
            <SheetTitle>New outreach draft</SheetTitle>
            <SheetDescription>Saved as a draft. Nothing is sent from the app.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-3 px-4">
            <div className="grid gap-1.5">
              <Label>Company (priority or with contacts)</Label>
              <Select onValueChange={(value) => { setCompanyId(value); setContactId("none"); setJobId("none"); }} value={companyId}>
                <SelectTrigger aria-label="Company" className="w-full">
                  <SelectValue placeholder="Pick a company" />
                </SelectTrigger>
                <SelectContent>
                  {list.map((entry) => (
                    <SelectItem key={entry.id} value={String(entry.id)}>
                      {entry.priority ? "★ " : ""}
                      {entry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {company ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>To</Label>
                  <Select onValueChange={setContactId} value={contactId}>
                    <SelectTrigger aria-label="Contact" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No one yet</SelectItem>
                      {company.contacts.map((contact) => (
                        <SelectItem key={contact.id} value={String(contact.id)}>
                          {contact.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>About job</Label>
                  <Select onValueChange={setJobId} value={jobId}>
                    <SelectTrigger aria-label="Job" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">General</SelectItem>
                      {company.jobs.map((job) => (
                        <SelectItem key={job.id} value={String(job.id)}>
                          {job.code} · {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Channel</Label>
                <Select onValueChange={setChannel} value={channel}>
                  <SelectTrigger aria-label="Channel" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="draft-subject">Subject (email)</Label>
                <Input id="draft-subject" onChange={(event) => setSubject(event.target.value)} value={subject} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="draft-body">Message</Label>
              <Textarea className="min-h-36" id="draft-body" onChange={(event) => setBody(event.target.value)} required value={body} />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <SheetFooter>
            <Button disabled={!companyId} type="submit">
              Save draft
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function DraftCard({ item, mutate }: { item: Outreach; mutate: (path: string, method: string, body?: unknown) => Promise<void> }) {
  const [body, setBody] = useState(item.body);
  const [copied, setCopied] = useState(false);
  const dirty = body !== item.body;

  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; the text stays selectable in the box.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {item.contactName ?? "No one assigned"}
          <span className="font-normal text-muted-foreground">at {item.company}</span>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge variant="outline">{item.channel}</Badge>
          {item.code ? <span className="font-mono text-xs">{item.code}</span> : null}
          {item.jobTitle ? <span>{item.jobTitle}</span> : null}
          {item.contactTitle ? <span>· {item.contactTitle.split("|")[0].trim()}</span> : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3">
        {item.subject ? <p className="text-sm font-medium">Subject: {item.subject}</p> : null}
        <Textarea
          aria-label="Message"
          className="min-h-32 text-base"
          disabled={item.status !== "draft"}
          onChange={(event) => setBody(event.target.value)}
          value={body}
        />
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {item.contactLinkedin ? (
            <a className="inline-flex items-center gap-1 hover:text-foreground" href={item.contactLinkedin} rel="noreferrer" target="_blank">
              <ExternalLink aria-hidden="true" className="size-3.5" />
              Their LinkedIn
            </a>
          ) : null}
          {item.contactEmail ? (
            <a className="inline-flex items-center gap-1 hover:text-foreground" href={`mailto:${item.contactEmail}`}>
              <Mail aria-hidden="true" className="size-3.5" />
              {item.contactEmail}
            </a>
          ) : null}
          {item.sentOn ? <span>Sent {formatDay(item.sentOn)}</span> : null}
          {item.followUpOn && item.status === "sent" ? <span>· Follow up {formatDay(item.followUpOn)}</span> : null}
          {item.source === "auto" ? <Badge variant="secondary">Drafted by Claude</Badge> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {item.status === "draft" ? (
            <>
              <Button onClick={() => void copy()} size="sm" type="button" variant="outline">
                {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              {dirty ? (
                <Button onClick={() => void mutate(`outreach/${item.id}`, "PATCH", { body })} size="sm" type="button" variant="outline">
                  Save edits
                </Button>
              ) : null}
              <Button
                onClick={() => {
                  if (window.confirm("Mark as sent? Only do this after you sent it yourself.")) {
                    void mutate(`outreach/${item.id}`, "PATCH", { status: "sent", ...(dirty ? { body } : {}) });
                  }
                }}
                size="sm"
                type="button"
              >
                <Send aria-hidden="true" />I sent it
              </Button>
            </>
          ) : null}
          {item.status === "sent" ? (
            <Button onClick={() => void mutate(`outreach/${item.id}`, "PATCH", { status: "replied" })} size="sm" type="button">
              <Reply aria-hidden="true" />
              They replied
            </Button>
          ) : null}
          {item.status !== "dropped" && item.status !== "replied" ? (
            <Button onClick={() => void mutate(`outreach/${item.id}`, "PATCH", { status: "dropped" })} size="sm" type="button" variant="ghost">
              <X aria-hidden="true" />
              Drop
            </Button>
          ) : null}
          <Button
            aria-label="Delete draft"
            onClick={() => {
              if (window.confirm("Delete this message?")) void mutate(`outreach/${item.id}`, "DELETE");
            }}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OutreachPage() {
  const { data, error, mutate, reload } = useResource<Outreach[]>("outreach");
  const items = data ?? [];
  const groups: { value: string; label: string; match: (item: Outreach) => boolean }[] = [
    { value: "draft", label: "To send", match: (item) => item.status === "draft" },
    { value: "sent", label: "Sent", match: (item) => item.status === "sent" },
    { value: "replied", label: "Replied", match: (item) => item.status === "replied" },
    { value: "dropped", label: "Dropped", match: (item) => item.status === "dropped" },
  ];

  return (
    <PageBody>
      <PageHeader
        description="Drafts for recruiters and hiring managers. You copy and send them yourself; nothing is sent from here."
        phase
        title="Outreach"
      >
        <NewDraftSheet onSaved={reload} />
      </PageHeader>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Tabs defaultValue="draft">
        <TabsList className="grid w-full grid-cols-4 sm:w-[28rem]">
          {groups.map((group) => (
            <TabsTrigger key={group.value} value={group.value}>
              {group.label}
              <span className="text-muted-foreground tabular-nums">{items.filter(group.match).length}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {groups.map((group) => {
          const rows = items.filter(group.match);
          return (
            <TabsContent className="mt-4" key={group.value} value={group.value}>
              {data && rows.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {group.value === "draft" ? "No drafts waiting. New ones appear here after the daily prep or New draft." : "Nothing here."}
                </p>
              ) : null}
              <ul className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                {rows.map((item) => (
                  <li key={item.id}>
                    <DraftCard item={item} key={`${item.id}-${item.body}-${item.status}`} mutate={mutate} />
                  </li>
                ))}
              </ul>
            </TabsContent>
          );
        })}
      </Tabs>
    </PageBody>
  );
}
