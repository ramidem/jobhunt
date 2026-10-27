"use client";

import { useState } from "react";
import { JobPostForm } from "@/components/workspace/job-post-form";
import { JobPostList } from "@/components/workspace/job-post-list";
import { useJobPosts } from "@/hooks/use-job-posts";
import { useUpdateJobStatus } from "@/hooks/use-update-job-status";
import { useSession } from "@/hooks/use-session";
import type { ApplicationStatus } from "@/lib/tracker";

export function JobPostsPanel() {
  const session = useSession();
  const userId = session?.user.id;

  if (!userId) {
    return <p className="text-sm text-muted-foreground">Auth is not configured, so jobs cannot be saved.</p>;
  }

  return <JobPostsEditor userId={userId} />;
}

function JobPostsEditor({ userId }: Readonly<{ userId: string }>) {
  const { jobs, error, reload } = useJobPosts(userId);
  const updateStatus = useUpdateJobStatus();
  const [statusError, setStatusError] = useState<string | null>(null);

  async function changeStatus(id: number, status: ApplicationStatus) {
    const result = await updateStatus(userId, id, status);
    if (!result.ok) {
      setStatusError(result.error);
      return;
    }
    setStatusError(null);
    reload();
  }

  return (
    <div className="grid gap-6">
      <JobPostForm onSaved={reload} userId={userId} />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {statusError ? (
        <p className="text-sm text-destructive" role="alert">
          {statusError}
        </p>
      ) : null}
      {jobs ? <JobPostList jobs={jobs} onStatus={changeStatus} /> : <p className="text-sm text-muted-foreground">Loading jobs...</p>}
    </div>
  );
}
