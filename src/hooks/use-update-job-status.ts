"use client";

import { useCallback } from "react";
import { jobPostsService } from "@/services/container";

export function useUpdateJobStatus() {
  return useCallback(
    (userId: string, id: number, status: string) => jobPostsService().updateStatus(userId, id, status),
    [],
  );
}
