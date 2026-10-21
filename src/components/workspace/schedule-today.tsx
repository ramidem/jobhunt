"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Schedule, ScheduleBlock } from "@/lib/api";

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatTime(start: string) {
  const [h, m] = start.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

// A live count shown beside blocks whose work is driven by existing data.
export function hintFor(block: ScheduleBlock, hints: Schedule["hints"]) {
  if (block.kind === "outreach") {
    return [hints.followUpsDue ? `${hints.followUpsDue} follow-ups due` : "", hints.draftsToSend ? `${hints.draftsToSend} drafts to send` : ""]
      .filter(Boolean)
      .join(", ");
  }
  if (block.kind === "learn") return hints.cardsDue ? `${hints.cardsDue} cards due` : "";
  return "";
}

export function TodayBlocks({ schedule, onToggle }: { schedule: Schedule; onToggle: (block: ScheduleBlock, done: boolean) => void }) {
  const blocks = schedule.blocks.filter((block) => block.weekday === schedule.weekday);
  if (blocks.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing scheduled today.</p>;
  }
  return (
    <ul className="divide-y rounded-xl border bg-card">
      {blocks.map((block) => {
        const hint = hintFor(block, schedule.hints);
        return (
          <li className="flex items-center gap-3 px-4 py-3" key={block.id}>
            <button
              aria-label={block.doneToday ? `Mark ${block.title} not done` : `Mark ${block.title} done`}
              aria-pressed={block.doneToday}
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-md border",
                block.doneToday && "border-primary bg-primary text-primary-foreground",
              )}
              onClick={() => onToggle(block, !block.doneToday)}
              type="button"
            >
              {block.doneToday ? <Check aria-hidden="true" className="size-4" /> : null}
            </button>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-medium", block.doneToday && "text-muted-foreground line-through")}>
                {block.href ? (
                  <Link className="underline-offset-4 hover:underline" href={block.href}>
                    {block.title}
                  </Link>
                ) : (
                  block.title
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTime(block.start)} · {block.minutes} min{hint ? ` · ${hint}` : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
