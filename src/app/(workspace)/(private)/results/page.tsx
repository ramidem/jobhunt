"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { useResource, type Funnel } from "@/lib/api";
import { formatDay } from "@/lib/format";

type Weekly = {
  today: string;
  draftsToSend: { id: number; company: string; contactName: string | null; code: string | null; channel: string }[];
  followUps: { company: string; contactName: string | null; due: string; reason: string }[];
  upcomingInterviews: { id: number; code: string; company: string; jobTitle: string; round: string; scheduledOn: string }[];
  newAtPriority: { code: string; company: string; title: string; url: string }[];
  funnel: Funnel;
};

function Bars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <ul className="grid grid-cols-1 gap-2.5">
      {rows.map((row) => (
        <li className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 text-sm" key={row.label}>
          <span className="truncate text-muted-foreground">{row.label}</span>
          <span className="h-2 rounded-full bg-muted">
            {row.value > 0 ? (
              <span className="block h-2 rounded-full bg-primary" style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }} />
            ) : null}
          </span>
          <span className="text-right tabular-nums">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}

const percent = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—");

export default function ResultsPage() {
  const { data, error } = useResource<Weekly>("weekly");

  return (
    <PageBody>
      <PageHeader
        description="What worked, and what to do this week."
        title="Results"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {data ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>This week</CardTitle>
              <CardDescription>The Monday summary adds this to your TODO page too.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 text-sm">
              <section className="grid gap-1">
                <h3 className="font-medium">
                  Drafts to send ({data.draftsToSend.length})
                </h3>
                {data.draftsToSend.length === 0 ? (
                  <p className="text-muted-foreground">None waiting.</p>
                ) : (
                  <p className="text-muted-foreground">
                    {data.draftsToSend
                      .slice(0, 5)
                      .map((draft) => `${draft.contactName ?? "General"} at ${draft.company}`)
                      .join(", ")}
                    {data.draftsToSend.length > 5 ? "…" : ""}{" "}
                    <Link className="underline underline-offset-4" href="/outreach">
                      Open Outreach
                    </Link>
                  </p>
                )}
              </section>
              <section className="grid gap-1">
                <h3 className="font-medium">Follow-ups due ({data.followUps.length})</h3>
                {data.followUps.length === 0 ? <p className="text-muted-foreground">Nothing due.</p> : null}
                <ul className="grid gap-1 text-muted-foreground">
                  {data.followUps.slice(0, 6).map((item, index) => (
                    <li key={`${item.company}-${index}`}>
                      {item.company}
                      {item.contactName ? ` · ${item.contactName}` : ""} · {formatDay(item.due)}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="grid gap-1">
                <h3 className="font-medium">Interviews in the next 7 days ({data.upcomingInterviews.length})</h3>
                {data.upcomingInterviews.length === 0 ? <p className="text-muted-foreground">None scheduled.</p> : null}
                <ul className="grid gap-1 text-muted-foreground">
                  {data.upcomingInterviews.map((item) => (
                    <li key={item.id}>
                      {formatDay(item.scheduledOn)} · {item.company} · {item.round} ({item.code})
                    </li>
                  ))}
                </ul>
              </section>
              <section className="grid gap-1">
                <h3 className="font-medium">New roles at priority companies ({data.newAtPriority.length})</h3>
                {data.newAtPriority.length === 0 ? <p className="text-muted-foreground">Nothing new this week.</p> : null}
                <ul className="grid gap-1 text-muted-foreground">
                  {data.newAtPriority.slice(0, 6).map((job) => (
                    <li key={job.code}>
                      <span className="font-mono text-xs">{job.code}</span> {job.company} · {job.title}
                    </li>
                  ))}
                </ul>
              </section>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funnel</CardTitle>
              <CardDescription>
                How far saved jobs get. Replied means a company or person wrote back.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <Bars
                rows={[
                  { label: "Saved", value: data.funnel.stages.saved },
                  { label: "Applied", value: data.funnel.stages.applied },
                  { label: "Replied", value: data.funnel.stages.replied },
                  { label: "Interviewing", value: data.funnel.stages.interviewing },
                  { label: "Offers", value: data.funnel.stages.offers },
                ]}
              />
              <p className="text-sm text-muted-foreground">
                Applied to replied: {percent(data.funnel.stages.replied, data.funnel.stages.applied)} · Replied to
                interviewing: {percent(data.funnel.stages.interviewing, data.funnel.stages.replied)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Direct outreach</CardTitle>
              <CardDescription>Messages you sent yourself to people at the company.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 text-center">
              {[
                ["Sent", data.funnel.outreach.sent],
                ["Replied", data.funnel.outreach.replied],
                ["Drafts", data.funnel.outreach.drafts],
              ].map(([label, value]) => (
                <div className="rounded-lg border p-3" key={label}>
                  <p className="text-2xl font-semibold tabular-nums">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
              <p className="col-span-3 text-left text-sm text-muted-foreground">
                Reply rate: {percent(data.funnel.outreach.replied, data.funnel.outreach.sent)}. After a few weeks this
                shows whether reaching out directly beats applying on boards.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>By source</CardTitle>
              <CardDescription>Where your saved jobs came from and how far they went.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="py-1 pr-3 font-normal">Source</th>
                      <th className="py-1 pr-3 text-right font-normal">Saved</th>
                      <th className="py-1 pr-3 text-right font-normal">Applied</th>
                      <th className="py-1 text-right font-normal">Replied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.funnel.bySource.map((row) => (
                      <tr key={row.source}>
                        <td className="py-1.5 pr-3">{row.source}</td>
                        <td className="py-1.5 pr-3 text-right tabular-nums">{row.saved}</td>
                        <td className="py-1.5 pr-3 text-right tabular-nums">{row.applied ?? 0}</td>
                        <td className="py-1.5 text-right tabular-nums">{row.replied ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </PageBody>
  );
}
