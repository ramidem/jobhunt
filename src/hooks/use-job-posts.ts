"use client";

import { useCallback, useEffect, useState } from "react";
import { jobPostsService } from "@/services/container";
import type { JobPost } from "@/services/job-posts";

// jobs is undefined while the first load is in flight.
export function useJobPosts(userId: string) {
  const [jobs, setJobs] = useState<JobPost[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let stale = false;
    jobPostsService()
      .list(userId)
      .then((result) => {
        if (stale) {
          return;
        }
        if (result.ok) {
          setJobs(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
      });
    return () => {
      stale = true;
    };
  }, [userId, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return { jobs, error, reload };
}
