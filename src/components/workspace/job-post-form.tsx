"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSaveJobPost } from "@/hooks/use-save-job-post";
import { APPLICATION_STATUSES, isApplicationStatus, type ApplicationStatus } from "@/lib/tracker";
import type { JobPost } from "@/services/job-posts";

type Notice = { kind: "error"; text: string } | { kind: "duplicate"; job: JobPost | null };

export function JobPostForm({ userId, onSaved }: Readonly<{ userId: string; onSaved: () => void }>) {
  const save = useSaveJobPost();
  const [status, setStatus] = useState<ApplicationStatus>("Saved");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    const result = await save(userId, {
      url: String(data.get("url") ?? ""),
      description: String(data.get("description") ?? ""),
      status,
    });
    setBusy(false);

    if (!result.ok) {
      setNotice({ kind: "error", text: result.error });
      return;
    }

    switch (result.data.status) {
      case "saved":
        setNotice(null);
        form.reset();
        setStatus("Saved");
        onSaved();
        return;
      case "duplicate":
        setNotice({ kind: "duplicate", job: result.data.job });
        return;
      default: {
        const unreachable: never = result.data;
        return unreachable;
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a job</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="job-url">Link</Label>
            <Input autoComplete="url" id="job-url" name="url" required type="url" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="job-description">Description</Label>
            <Textarea id="job-description" name="description" required rows={8} />
            <p className="text-sm text-muted-foreground">At least 50 characters, pasted from the posting.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="job-status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => {
                if (isApplicationStatus(value)) {
                  setStatus(value);
                }
              }}
            >
              <SelectTrigger className="w-full max-w-xs" id="job-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {notice?.kind === "error" ? (
            <p className="text-sm text-destructive" role="alert">
              {notice.text}
            </p>
          ) : null}
          {notice?.kind === "duplicate" ? (
            <p className="text-sm" role="status">
              already saved
              {notice.job ? (
                <>
                  {" "}
                  <a className="underline underline-offset-4" href={`#job-${notice.job.id}`}>
                    View saved job
                  </a>
                </>
              ) : null}
            </p>
          ) : null}
          <Button className="w-fit" disabled={busy} type="submit">
            {busy ? "Saving..." : "Save job"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
