"use client";

import { useCallback, useEffect, useState } from "react";
import { profileService } from "@/services/container";
import type { Profile } from "@/services/profile";

// profile is undefined while loading and null when the user has no profile row.
export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let stale = false;
    profileService()
      .getOwn(userId)
      .then((result) => {
        if (stale) {
          return;
        }
        if (result.ok) {
          setProfile(result.data);
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

  return { profile, error, reload };
}
