"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { api, useResource, type Application, type Interview, type InterviewsData, type Offer } from "@/lib/api";
import { formatDay } from "@/lib/format";

const ROUNDS = ["Screen", "Recruiter", "Technical", "Take-home", "Manager", "Final"];
const FORMATS = ["Video", "Phone", "Onsite", "Async"];
const OUTCOMES = ["pending", "passed", "rejected", "withdrew"] as const;

function JobPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const apps = useResource<Application[]>("applications");
  const list = (apps.data ?? []).filter((item) => item.status !== "Rejected" && item.status !== "Withdrawn");
  const ranked = [...list].sort(
    (a, b) => Number(b.priority) - Number(a.priority) || ["Offer", "Interviewing", "Applied", "Saved"].indexOf(a.status) - ["Offer", "Interviewing", "Applied", "Saved"].indexOf(b.status),
  );
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger aria-label="Job" className="w-full">
        <SelectValue placeholder="Pick a job (priority and applied first)" />
      </SelectTrigger>
      <SelectContent>
        {ranked.slice(0, 80).map((item) => (
          <SelectItem key={item.jobId} value={String(item.jobId)}>
            {item.priority ? "★ " : ""}
            {item.code} · {item.company} · {item.role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function AddSheet({ kind, onSaved }: { kind: "interview" | "offer"; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [jobId, setJobId] = useState("");
  const [fields, setFields] = useState({ round: "Screen", scheduledOn: "", withWhom: "", format: "Video", prep: "", pay: "", schedule: "", benefits: "", growth: "", notes: "" });
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api(kind === "interview" ? "interviews" : "offers", { method: "POST", body: { jobId: Number(jobId), ...fields } });
      setError(null);
      setOpen(false);
      onSaved();
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  const set = (key: keyof typeof fields) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields({ ...fields, [key]: event.target.value });

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          {kind === "interview" ? "Add interview" : "Add offer"}
        </Button>
      </SheetTrigger>
      <SheetContent
        className="mx-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-xl pb-[env(safe-area-inset-bottom)]"
        side="bottom"
      >
        <form onSubmit={save}>
          <SheetHeader>
            <SheetTitle>{kind === "interview" ? "Add an interview round" : "Add an offer"}</SheetTitle>
            <SheetDescription>
              {kind === "interview" ? "Moves the job to Interviewing." : "Moves the job to Offer."}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-3 px-4">
            <div className="grid gap-1.5">
              <Label>Job</Label>
              <JobPicker onChange={setJobId} value={jobId} />
            </div>
            {kind === "interview" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Round</Label>
                    <Select onValueChange={(value) => setFields({ ...fields, round: value })} value={fields.round}>
                      <SelectTrigger aria-label="Round" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROUNDS.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Format</Label>
                    <Select onValueChange={(value) => setFields({ ...fields, format: value })} value={fields.format}>
                      <SelectTrigger aria-label="Format" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMATS.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="iv-date">Date</Label>
                    <Input id="iv-date" onChange={set("scheduledOn")} type="date" value={fields.scheduledOn} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="iv-with">Meeting with</Label>
                    <Input id="iv-with" onChange={set("withWhom")} value={fields.withWhom} />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="iv-prep">Prep brief (company recap, likely questions, what to ask)</Label>
                  <Textarea className="min-h-28" id="iv-prep" onChange={set("prep")} value={fields.prep} />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="of-pay">Pay</Label>
                    <Input id="of-pay" onChange={set("pay")} value={fields.pay} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="of-schedule">Schedule</Label>
                    <Input id="of-schedule" onChange={set("schedule")} value={fields.schedule} />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="of-benefits">Benefits</Label>
                  <Textarea id="of-benefits" onChange={set("benefits")} rows={2} value={fields.benefits} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="of-growth">Growth and team</Label>
                  <Textarea id="of-growth" onChange={set("growth")} rows={2} value={fields.growth} />
                </div>
              </>
            )}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <SheetFooter>
            <Button disabled={!jobId} type="submit">
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function InterviewCard({ item, mutate }: { item: Interview; mutate: (path: string, method: string, body?: unknown) => Promise<void> }) {
  const [prep, setPrep] = useState(item.prep);
  const [notes, setNotes] = useState(item.notes);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-snug">
          <span className="mr-2 inline-block rounded-md border px-1.5 py-0.5 align-middle font-mono text-xs text-muted-foreground">{item.code}</span>
          {item.company}
        </CardTitle>
        <CardDescription>
          {item.round} · {item.format}
          {item.scheduledOn ? ` · ${formatDay(item.scheduledOn)}` : " · date not set"}
          {item.withWhom ? ` · with ${item.withWhom}` : ""}
          <br />
          {item.jobTitle}
        </CardDescription>
        <CardAction className="flex">
          <Button
            aria-label="Delete this round"
            onClick={() => {
              if (window.confirm("Delete this interview round?")) void mutate(`interviews/${item.id}`, "DELETE");
            }}
            size="icon"
            variant="ghost"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor={`prep-${item.id}`}>Prep brief</Label>
          <Textarea className="min-h-28" id={`prep-${item.id}`} onBlur={() => prep !== item.prep && void mutate(`interviews/${item.id}`, "PATCH", { prep })} onChange={(event) => setPrep(event.target.value)} value={prep} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`notes-${item.id}`}>Notes after</Label>
          <Textarea id={`notes-${item.id}`} onBlur={() => notes !== item.notes && void mutate(`interviews/${item.id}`, "PATCH", { notes })} onChange={(event) => setNotes(event.target.value)} rows={2} value={notes} />
        </div>
        <div className="grid gap-1.5 sm:max-w-48">
          <Label>Outcome</Label>
          <Select onValueChange={(value) => void mutate(`interviews/${item.id}`, "PATCH", { outcome: value })} value={item.outcome}>
            <SelectTrigger aria-label="Outcome" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OUTCOMES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value[0].toUpperCase() + value.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function OfferCard({ item, mutate }: { item: Offer; mutate: (path: string, method: string, body?: unknown) => Promise<void> }) {
  const rows: [string, string][] = [
    ["Pay", item.pay],
    ["Schedule", item.schedule],
    ["Benefits", item.benefits],
    ["Growth", item.growth],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-snug">
          <span className="mr-2 inline-block rounded-md border px-1.5 py-0.5 align-middle font-mono text-xs text-muted-foreground">{item.code}</span>
          {item.company}
        </CardTitle>
        <CardDescription>
          {item.jobTitle} · received {item.receivedOn ? formatDay(item.receivedOn) : "—"}
        </CardDescription>
        <CardAction>
          <Badge variant={item.decision === "open" ? "default" : "outline"}>{item.decision}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 text-sm">
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="whitespace-pre-wrap">{value || "—"}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-2">
          {item.decision === "open" ? (
            <>
              <Button onClick={() => void mutate(`offers/${item.id}`, "PATCH", { decision: "accepted" })} size="sm">
                Accepted
              </Button>
              <Button onClick={() => void mutate(`offers/${item.id}`, "PATCH", { decision: "declined" })} size="sm" variant="outline">
                Declined
              </Button>
            </>
          ) : null}
          <Button aria-label="Delete offer" onClick={() => window.confirm("Delete this offer?") && void mutate(`offers/${item.id}`, "DELETE")} size="icon" variant="ghost">
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InterviewsPage() {
  const { data, error, mutate, reload } = useResource<InterviewsData>("interviews");
  const interviews = data?.interviews ?? [];
  const offers = data?.offers ?? [];
  // The generic mutate expects the same list type back; both endpoints return InterviewsData.
  const act = mutate;

  return (
    <PageBody>
      <PageHeader description="Rounds, prep briefs and offers." title="Interviews" />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Tabs defaultValue="rounds">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="grid w-full grid-cols-2 sm:w-72">
            <TabsTrigger value="rounds">
              Rounds <span className="text-muted-foreground tabular-nums">{interviews.length}</span>
            </TabsTrigger>
            <TabsTrigger value="offers">
              Offers <span className="text-muted-foreground tabular-nums">{offers.length}</span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent className="mt-4 grid grid-cols-1 gap-4" value="rounds">
          <div>
            <AddSheet kind="interview" onSaved={reload} />
          </div>
          {data && interviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No interviews yet. Add one when a company invites you.</p>
          ) : null}
          <ul className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {interviews.map((item) => (
              <li key={item.id}>
                <InterviewCard item={item} key={`${item.id}-${item.outcome}`} mutate={act} />
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent className="mt-4 grid grid-cols-1 gap-4" value="offers">
          <div>
            <AddSheet kind="offer" onSaved={reload} />
          </div>
          {data && offers.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No offers yet.</p> : null}
          <ul className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {offers.map((item) => (
              <li key={item.id}>
                <OfferCard item={item} mutate={act} />
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </PageBody>
  );
}
