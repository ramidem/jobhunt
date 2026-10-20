"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { useResource, type Improvement, type Improvements } from "@/lib/api";

const AREA_LABEL: Record<Improvement["area"], string> = { learning: "Learning", applications: "Applications", other: "Other" };
const IMPACT_LABEL: Record<Improvement["impact"], string> = { 3: "High impact", 2: "Medium impact", 1: "Low impact" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function ItemCard({ item, onSet }: { item: Improvement; onSet: (status: Improvement["status"]) => void }) {
  const closed = item.status !== "open";
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{AREA_LABEL[item.area]}</Badge>
          {!closed ? <Badge variant="outline">{IMPACT_LABEL[item.impact]}</Badge> : null}
          {closed ? (
            <Badge variant="outline">
              {item.status === "done" ? (item.closedBy === "auto" ? "Fixed" : "Done") : "Dismissed"} {item.closedOn}
            </Badge>
          ) : null}
          {item.dueOn && !closed ? <Badge variant="outline">By {item.dueOn}</Badge> : null}
        </div>
        <CardTitle className="text-base">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <dl className="grid gap-3">
          <Field label="Why">{item.why}</Field>
          <Field label="How">{item.how}</Field>
          <Field label="Where">{item.source}</Field>
        </dl>
        <div className="flex flex-wrap items-center gap-2">
          {closed ? (
            <Button onClick={() => onSet("open")} size="sm" type="button" variant="outline">
              <RotateCcw aria-hidden="true" /> Reopen
            </Button>
          ) : (
            <>
              <Button onClick={() => onSet("done")} size="sm" type="button">
                <Check aria-hidden="true" /> Done
              </Button>
              <Button onClick={() => onSet("dismissed")} size="sm" type="button" variant="ghost">
                <X aria-hidden="true" /> Dismiss
              </Button>
            </>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {item.writtenBy === "claude" ? "Advice by Claude" : "Auto-flagged, general advice"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ImprovementsPage() {
  const { data, error, mutate } = useResource<Improvements>("improvements");
  const open = data?.open ?? [];
  const closed = data?.closed ?? [];
  const set = (item: Improvement) => (status: Improvement["status"]) =>
    void mutate(`improvements/${item.id}`, "PATCH", { status });

  return (
    <PageBody>
      <PageHeader
        title="Improvements"
        description="What to get better at, why it matters, how to do it, and where it came from. Flagged automatically; Claude rewrites the advice every 3 days."
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <p className="text-xs text-muted-foreground">
        {data?.refreshedOn ? `Claude last refreshed the advice on ${data.refreshedOn}.` : "Claude has not refreshed the advice yet."}
        {" "}Items close themselves once the problem is fixed.
      </p>

      <Tabs defaultValue="open">
        <TabsList className="grid w-full grid-cols-2 sm:w-72">
          <TabsTrigger value="open">Open ({open.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closed.length})</TabsTrigger>
        </TabsList>
        <TabsContent className="mt-4 grid gap-4" value="open">
          {data && open.length === 0 ? <p className="text-sm text-muted-foreground">Nothing to improve right now.</p> : null}
          {open.map((item) => (
            <ItemCard item={item} key={item.id} onSet={set(item)} />
          ))}
        </TabsContent>
        <TabsContent className="mt-4 grid gap-4" value="closed">
          {closed.length === 0 ? <p className="text-sm text-muted-foreground">Nothing closed yet.</p> : null}
          {closed.map((item) => (
            <ItemCard item={item} key={item.id} onSet={set(item)} />
          ))}
        </TabsContent>
      </Tabs>
    </PageBody>
  );
}
