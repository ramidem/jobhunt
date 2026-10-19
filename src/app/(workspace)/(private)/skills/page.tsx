"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { skillSeeds } from "@/data/job-leads";
import { resume } from "@/data/resume";
import {
  SKILLS_KEY,
  SKILL_STATUSES,
  newId,
  takeUnseeded,
  type Skill,
  type SkillStatus,
} from "@/lib/tracker";
import { useLocalStorage } from "@/lib/use-local-storage";

const LABELS: Record<SkillStatus, string> = {
  know: "I know",
  learning: "Learning",
  want: "Want to learn",
};

export default function SkillsPage() {
  const [skills, setSkills, ready] = useLocalStorage<Skill[]>(SKILLS_KEY, []);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<SkillStatus>("want");
  const [tab, setTab] = useState<SkillStatus>("want");

  // First visit: seed "I know" from the resume's skills, then add any new skill seeds.
  useEffect(() => {
    if (!ready) {
      return;
    }
    const firstVisit = window.localStorage.getItem(SKILLS_KEY) === null;
    const fresh = takeUnseeded(skillSeeds);
    if (!firstVisit && fresh.length === 0) {
      return;
    }
    setSkills((previous) => {
      const base = firstVisit
        ? resume.skills.flatMap((group) =>
            group.items.map((item) => ({ id: newId(), name: item, status: "know" as const })),
          )
        : previous;
      const names = new Set(base.map((skill) => skill.name.toLowerCase()));
      return [...base, ...fresh.filter((seed) => !names.has(seed.name.toLowerCase()))];
    });
  }, [ready, setSkills]);

  function add(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || skills.some((skill) => skill.name.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    setSkills((previous) => [...previous, { id: newId(), name: trimmed, status }]);
    setName("");
    setTab(status);
  }

  function setSkillStatus(id: string, next: SkillStatus) {
    setSkills((previous) =>
      previous.map((entry) => (entry.id === id ? { ...entry, status: next } : entry)),
    );
  }

  return (
    <PageBody>
      <PageHeader
        title="Skills"
        description="What you know and what roles keep asking for. Stored in this browser only."
      />

      <Card>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-[1fr_11rem_auto] sm:items-end" onSubmit={add}>
            <div className="grid gap-1.5">
              <Label htmlFor="new-skill">Skill</Label>
              <Input
                id="new-skill"
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Docker"
                required
                value={name}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select onValueChange={(value) => setStatus(value as SkillStatus)} value={status}>
                <SelectTrigger aria-label="Status for new skill" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">
              <Plus aria-hidden="true" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs onValueChange={(value) => setTab(value as SkillStatus)} value={tab}>
        <TabsList className="grid w-full grid-cols-3">
          {SKILL_STATUSES.map((column) => (
            <TabsTrigger key={column} value={column}>
              {LABELS[column]}
              <span className="text-muted-foreground tabular-nums">
                {skills.filter((skill) => skill.status === column).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {SKILL_STATUSES.map((column) => {
          const items = skills
            .filter((skill) => skill.status === column)
            .sort((a, b) => (b.demand ?? 0) - (a.demand ?? 0));
          return (
            <TabsContent className="mt-3" key={column} value={column}>
              <Card className="py-0">
                {ready && items.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">Nothing here yet.</p>
                ) : null}
                <ul className="divide-y">
                  {items.map((skill) => (
                    <li className="flex items-center gap-3 px-4 py-3" key={skill.id}>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{skill.name}</p>
                        {skill.demand ? (
                          <p className="text-xs text-muted-foreground">
                            Asked for in {skill.demand} saved roles
                          </p>
                        ) : null}
                      </div>
                      <Select
                        onValueChange={(value) => setSkillStatus(skill.id, value as SkillStatus)}
                        value={skill.status}
                      >
                        <SelectTrigger aria-label={`Status for ${skill.name}`} className="w-34 shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SKILL_STATUSES.map((value) => (
                            <SelectItem key={value} value={value}>
                              {LABELS[value]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        aria-label={`Remove ${skill.name}`}
                        className="shrink-0"
                        onClick={() =>
                          setSkills((previous) => previous.filter((entry) => entry.id !== skill.id))
                        }
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </PageBody>
  );
}
