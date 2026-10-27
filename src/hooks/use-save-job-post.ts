"use client";

import { useCallback } from "react";
import { jobPostsService } from "@/services/container";

export function useSaveJobPost() {
  return useCallback(
    (userId: string, input: { url: string; description: string; status: string }) => jobPostsService().save(userId, input),
    [],
  );
}
