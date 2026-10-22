"use client";

import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { useResource, type LearningPath, type LearningStep, type Preference, type SkillRecommendations } from "@/lib/api";
import { cn } from "@/lib/utils";

const NEXT_STATUS: Record<LearningStep["status"], LearningStep["status"]> = { todo: "doing", doing: "done", done: "todo" };
const STATUS_LABEL: Record<LearningStep["status"], string> = { todo: "To do", doing: "Doing", done: "Done" };

function PathCard({ path, onChange }: { path: LearningPath; onChange: (sub: string, method: string, body?: unknown) => void }) {
  const [title, setTitle] = useState("");
  const done = path.steps.filter((step) => step.status === "done").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{path.title}</CardTitle>
            {path.goal ? <p className="text-sm text-muted-foreground">{path.goal}</p> : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {done} of {path.steps.length} done{path.skill ? ` · skill: ${path.skill}` : ""}
            </p>
          </div>
          <Button
            aria-label={`Delete ${path.title}`}
            onClick={() => onChange(`learning-paths/${path.id}`, "DELETE")}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 px-0">
        <ol className="divide-y">
          {path.steps.map((step, index) => (
            <li className="flex items-start gap-3 px-4 py-3" key={step.id}>
              <Button
                className="shrink-0"
                onClick={() => onChange(`learning-steps/${step.id}`, "PATCH", { status: NEXT_STATUS[step.status] })}
                size="sm"
                type="button"
                variant={step.status === "done" ? "secondary" : step.status === "doing" ? "default" : "outline"}
              >
                {STATUS_LABEL[step.status]}
              </Button>
              <div className="min-w-0 flex-1">
                <p className={cn("font-medium", step.status === "done" && "text-muted-foreground line-through")}>
                  {index + 1}. {step.title}
                </p>
                {step.notes ? <p className="text-sm text-muted-foreground">{step.notes}</p> : null}
                {step.url ? (
                  <a className="inline-flex items-center gap-1 text-sm underline" href={step.url} rel="noreferrer" target="_blank">
                    Open <ExternalLink aria-hidden="true" className="size-3" />
                  </a>
                ) : null}
              </div>
              <Button
                aria-label={`Delete ${step.title}`}
                onClick={() => onChange(`learning-steps/${step.id}`, "DELETE")}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ol>
        <form
          className="flex gap-2 px-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return;
            onChange("learning-steps", "POST", { pathId: path.id, title: title.trim() });
            setTitle("");
          }}
        >
          <Input aria-label={`New step for ${path.title}`} onChange={(e) => setTitle(e.target.value)} placeholder="Add a step" value={title} />
          <Button type="submit">
            <Plus aria-hidden="true" />
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LearningPathPage() {
  const paths = useResource<LearningPath[]>("learning-paths");
  const prefs = useResource<Preference[]>("preferences");
  const recs = useResource<SkillRecommendations>("skill-recommendations");
  const [pathTitle, setPathTitle] = useState("");
  const [pref, setPref] = useState("");
  const [kind, setKind] = useState<Preference["kind"]>("like");

  return (
    <PageBody>
      <PageHeader
        title="Learning path"
        description="Step-by-step plans for skills the postings ask for. Tap a step's status to move it along."
      />
      {paths.error ? <p className="text-sm text-destructive">{paths.error}</p> : null}

      <section className="grid gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">Recommended next</h2>
        <p className="text-xs text-muted-foreground">
          Skills you do not know yet, ranked by how many saved job posts mention them
          {recs.data ? ` (skills found in ${recs.data.jobsWithSkills} of ${recs.data.totalJobs} posts; add descriptions to improve this)` : ""}.
        </p>
        <Card className="py-0">
          <CardContent className="px-0">
            <ul className="divide-y">
              {(recs.data?.skills ?? []).map((skill) => (
                <li className="flex items-start gap-3 px-4 py-3" key={skill.id}>
                  <span className="w-10 shrink-0 text-right text-lg font-semibold tabular-nums">{skill.demand}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {skill.name} <span className="text-xs font-normal text-muted-foreground">{skill.status}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {skill.examples.map((job) => `${job.title} (${job.company})`).join(" · ")}
                    </p>
                  </div>
                  {skill.pathId ? (
                    <span className="shrink-0 text-xs text-muted-foreground">Path started</span>
                  ) : (
                    <Button
                      onClick={() => {
                        void recs.mutate("skill-path", "POST", { skill: skill.name }).then(() => paths.reload());
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Start a path
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            {recs.data && recs.data.skills.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No skills to recommend yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!pathTitle.trim()) return;
          void paths.mutate("learning-paths", "POST", { title: pathTitle.trim() });
          setPathTitle("");
        }}
      >
        <Input aria-label="New learning path" onChange={(e) => setPathTitle(e.target.value)} placeholder="New path, e.g. Automation with n8n" value={pathTitle} />
        <Button type="submit">
          <Plus aria-hidden="true" />
          Add path
        </Button>
      </form>

      {(paths.data ?? []).map((path) => (
        <PathCard key={path.id} onChange={(sub, method, body) => void paths.mutate(sub, method, body)} path={path} />
      ))}
      {paths.data && paths.data.length === 0 ? <p className="text-sm text-muted-foreground">No paths yet.</p> : null}

      <section className="grid gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">What Claude has learned about your preferences</h2>
        <Card className="py-0">
          <CardContent className="px-0">
            <ul className="divide-y">
              {(prefs.data ?? []).map((item) => (
                <li className="flex items-center gap-3 px-4 py-3" key={item.id}>
                  <span className="w-12 shrink-0 text-xs uppercase text-muted-foreground">{item.kind}</span>
                  <span className="flex-1 text-sm">{item.text}</span>
                  <Button
                    aria-label={`Delete preference ${item.text}`}
                    onClick={() => void prefs.mutate(`preferences/${item.id}`, "DELETE")}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
            {prefs.data && prefs.data.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">Nothing recorded yet.</p> : null}
          </CardContent>
        </Card>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!pref.trim()) return;
            void prefs.mutate("preferences", "POST", { kind, text: pref.trim(), source: "app" });
            setPref("");
          }}
        >
          <select
            aria-label="Preference type"
            className="rounded-md border bg-background px-2 text-sm"
            onChange={(e) => setKind(e.target.value as Preference["kind"])}
            value={kind}
          >
            <option value="like">like</option>
            <option value="avoid">avoid</option>
            <option value="rule">rule</option>
          </select>
          <Input aria-label="New preference" onChange={(e) => setPref(e.target.value)} placeholder="Add a preference" value={pref} />
          <Button type="submit">Add</Button>
        </form>
      </section>
    </PageBody>
  );
}
