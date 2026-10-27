"use client";

import { useEffect, useState } from "react";
import { resumeContactService } from "@/services/container";
import type { ResumeContact } from "@/services/resume-contact";

// contact is undefined while loading and null when this account has no row.
export function useResumeContact(userId: string) {
  const [contact, setContact] = useState<ResumeContact | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stale = false;
    resumeContactService()
      .getOwn(userId)
      .then((result) => {
        if (stale) {
          return;
        }
        if (result.ok) {
          setContact(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
      });
    return () => {
      stale = true;
    };
  }, [userId]);

  return { contact, error };
}
