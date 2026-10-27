"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APPLICATION_STATUSES, isApplicationStatus, type ApplicationStatus } from "@/lib/tracker";
import type { JobPost } from "@/services/job-posts";

export function JobPostList({
  jobs,
  onStatus,
}: Readonly<{ jobs: JobPost[]; onStatus: (id: number, status: ApplicationStatus) => void }>) {
  if (jobs.length === 0) {
    return <p className="text-sm text-muted-foreground">No jobs saved yet.</p>;
  }

  return (
    <ul className="grid gap-3">
      {jobs.map((job) => (
        <li className="grid gap-3 rounded-xl border bg-background p-4" id={`job-${job.id}`} key={job.id}>
          <div className="grid gap-1">
            <a className="font-medium break-all underline-offset-4 hover:underline" href={job.url} rel="noreferrer" target="_blank">
              {job.title ?? job.url}
            </a>
            {job.company ? <p className="text-sm text-muted-foreground">{job.company}</p> : null}
            <p className="line-clamp-3 text-sm text-muted-foreground">{job.description}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`status-${job.id}`}>Status</Label>
            <Select
              value={job.status}
              onValueChange={(value) => {
                if (isApplicationStatus(value)) {
                  onStatus(job.id, value);
                }
              }}
            >
              <SelectTrigger className="w-full max-w-xs" id={`status-${job.id}`}>
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
        </li>
      ))}
    </ul>
  );
}
