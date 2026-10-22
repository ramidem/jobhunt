"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageBody, PageHeader } from "@/components/workspace/page-header";
import { TodayBlocks, WEEKDAYS, formatTime } from "@/components/workspace/schedule-today";
import { useResource, type Schedule } from "@/lib/api";

// Monday first, Sunday last.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function SchedulePage() {
  const { data, error, mutate } = useResource<Schedule>("schedule");
  const [title, setTitle] = useState("");
  const [weekday, setWeekday] = useState(1);
  const [start, setStart] = useState("09:00");
  const [minutes, setMinutes] = useState(30);

  return (
    <PageBody>
      <PageHeader
        title="Schedule"
        description="The weekly routine: scan for posts, apply, reach out, practice. Check blocks off as you go."
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {data ? (
        <>
          <section className="grid gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">Today · {WEEKDAYS[data.weekday]}</h2>
            <TodayBlocks
              onToggle={(block, done) => void mutate(`schedule-done/${block.id}`, "PUT", { day: data.today, done })}
              schedule={data}
            />
          </section>

          <section className="grid gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">Week</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {WEEK_ORDER.map((day) => {
                const blocks = data.blocks.filter((block) => block.weekday === day);
                return (
                  <div className="rounded-xl border bg-card p-4" key={day}>
                    <h3 className="text-sm font-semibold">{WEEKDAYS[day]}</h3>
                    {blocks.length === 0 ? <p className="mt-2 text-xs text-muted-foreground">Off.</p> : null}
                    <ul className="mt-2 grid gap-2">
                      {blocks.map((block) => (
                        <li className="flex items-start justify-between gap-2 text-sm" key={block.id}>
                          <span>
                            <span className="block">{block.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(block.start)} · {block.minutes} min
                            </span>
                          </span>
                          <Button
                            aria-label={`Remove ${block.title} on ${WEEKDAYS[day]}`}
                            onClick={() => void mutate(`schedule/${block.id}`, "DELETE")}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          <form
            className="grid gap-2 sm:grid-cols-[1fr_9rem_7rem_6rem_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              if (!title.trim()) return;
              void mutate("schedule", "POST", { title: title.trim(), weekday, start, minutes });
              setTitle("");
            }}
          >
            <Input aria-label="Block title" onChange={(e) => setTitle(e.target.value)} placeholder="Add a block, e.g. Mock interview" value={title} />
            <select
              aria-label="Day"
              className="h-9 rounded-md border bg-background px-2 text-sm"
              onChange={(e) => setWeekday(Number(e.target.value))}
              value={weekday}
            >
              {WEEK_ORDER.map((day) => (
                <option key={day} value={day}>
                  {WEEKDAYS[day]}
                </option>
              ))}
            </select>
            <Input aria-label="Start time" onChange={(e) => setStart(e.target.value)} type="time" value={start} />
            <Input aria-label="Minutes" min={5} onChange={(e) => setMinutes(Number(e.target.value) || 30)} type="number" value={minutes} />
            <Button type="submit">
              <Plus aria-hidden="true" />
              Add
            </Button>
          </form>
        </>
      ) : null}
    </PageBody>
  );
}
