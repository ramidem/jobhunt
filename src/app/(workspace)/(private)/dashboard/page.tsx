"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { TodayBlocks } from "@/components/workspace/schedule-today";
import { useResource, type Dashboard, type Schedule } from "@/lib/api";
import { formatDay } from "@/lib/format";

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50" href={href}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </Link>
  );
}

// One-series horizontal bars: label, bar, value. Values are always printed, so no legend or tooltip is needed.
function Bars({ rows, unit }: { rows: { label: string; value: number }[]; unit: string }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <ul className="grid grid-cols-1 gap-2.5">
      {rows.map((row) => (
        <li className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3 text-sm" key={row.label} title={`${row.label}: ${row.value} ${unit}`}>
          <span className="truncate text-muted-foreground">{row.label}</span>
          <span className="h-2 rounded-full bg-muted">
            {row.value > 0 ? (
              <span
                className="block h-2 rounded-full bg-primary"
                style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }}
              />
            ) : null}
          </span>
          <span className="text-right tabular-nums">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  const { data, error } = useResource<Dashboard>("dashboard");
  const { data: schedule, mutate: mutateSchedule } = useResource<Schedule>("schedule");

  return (
    <PageBody>
      <PageHeader title="Dashboard" description="Where the job hunt stands today." />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {data ? (
        <>
          {schedule ? (
            <section className="grid gap-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Today ·{" "}
                <Link className="underline underline-offset-4" href="/schedule">
                  Schedule
                </Link>
              </h2>
              <TodayBlocks
                onToggle={(block, done) => void mutateSchedule(`schedule-done/${block.id}`, "PUT", { day: schedule.today, done })}
                schedule={schedule}
              />
            </section>
          ) : null}
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Targeting:</span>
            {data.activeRoles.length === 0 ? (
              <Link className="underline underline-offset-4" href="/roles">
                No active roles yet. Pick some on Roles.
              </Link>
            ) : (
              data.activeRoles.map((role) => (
                <Link href="/roles" key={role.id}>
                  <Badge>{role.title}</Badge>
                </Link>
              ))
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Stat href="/applications" label="Postings saved" value={data.totals.jobs} />
            <Stat href="/companies" label="Companies" value={data.totals.companies} />
            <Stat href="/companies" label="Contacts" value={data.totals.contacts} />
            <Stat href="/companies" label="Contacted this week" value={data.totals.contactedThisWeek} />
            <Stat href="/companies" label="Never contacted" value={data.totals.neverContacted} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Follow-ups due</CardTitle>
                <CardDescription>
                  Follow-up dates you set, and applications with no contact for 7+ days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.followUps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing due.</p>
                ) : (
                  <ul className="grid grid-cols-1 gap-2 text-sm">
                    {data.followUps.map((item, index) => (
                      <li className="flex items-start justify-between gap-3" key={`${item.companyId}-${index}`}>
                        <div className="min-w-0">
                          <p className="font-medium">
                            {item.company}
                            {item.contactName ? ` · ${item.contactName}` : ""}
                          </p>
                          <p className="truncate text-muted-foreground">{item.reason}</p>
                        </div>
                        <span className="shrink-0 text-muted-foreground">{formatDay(item.due)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funnel</CardTitle>
                <CardDescription>
                  How far your saved jobs get. Replied means a company or person wrote back.
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
                  unit="jobs"
                />
                <p className="text-sm text-muted-foreground">
                  Direct outreach: {data.funnel.outreach.sent} sent, {data.funnel.outreach.replied} replied
                  {data.draftsToSend > 0 ? (
                    <>
                      {" · "}
                      <Link className="underline underline-offset-4" href="/outreach">
                        {data.draftsToSend} {data.draftsToSend === 1 ? "draft" : "drafts"} waiting to send
                      </Link>
                    </>
                  ) : null}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline</CardTitle>
                <CardDescription>Applications by status.</CardDescription>
              </CardHeader>
              <CardContent>
                <Bars
                  rows={data.pipeline.map((row) => ({ label: row.status, value: row.count }))}
                  unit="applications"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent contact</CardTitle>
                <CardDescription>The last people you reached out to or heard from.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recent.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nothing logged yet. Use “Log contact” on a job or company.
                  </p>
                ) : (
                  <ul className="grid grid-cols-1 gap-2 text-sm">
                    {data.recent.map((entry) => (
                      <li key={entry.id}>
                        <p>
                          <span className="font-medium">{entry.company}</span>
                          {entry.contactName ? ` · ${entry.contactName}` : ""}
                        </p>
                        <p className="text-muted-foreground">
                          {formatDay(entry.happenedOn)} · {entry.direction === "out" ? "Reached out" : "Replied"} via{" "}
                          {entry.channel}
                          {entry.summary ? ` · ${entry.summary}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top skill gaps</CardTitle>
                <CardDescription>Skills you don&apos;t have yet, by how many saved postings ask for them.</CardDescription>
              </CardHeader>
              <CardContent>
                <Bars rows={data.topGaps.map((row) => ({ label: row.name, value: row.demand }))} unit="postings" />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Sources</CardTitle>
                <CardDescription>Where saved postings came from.</CardDescription>
              </CardHeader>
              <CardContent>
                <Bars rows={data.sources.map((row) => ({ label: row.source, value: row.count }))} unit="postings" />
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </PageBody>
  );
}
