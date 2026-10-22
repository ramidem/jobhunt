"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { isValidUsername } from "@/lib/username";
import { createProfileService } from "@/services/profile";

export type UsernameStatus = "unchanged" | "invalid" | "checking" | "available" | "taken" | "error";

const DEBOUNCE_MS = 400;

// Checks a username against the database after the user stops typing.
export function useUsernameAvailability(candidate: string, current: string): UsernameStatus {
  const service = useMemo(() => createProfileService(getSupabase()), []);
  const [result, setResult] = useState<{ candidate: string; status: "available" | "taken" | "error" } | null>(null);

  const skip = candidate === current || !isValidUsername(candidate);

  useEffect(() => {
    if (skip) {
      return;
    }
    let stale = false;
    const timer = setTimeout(() => {
      service.isUsernameAvailable(candidate).then((answer) => {
        if (!stale) {
          setResult({ candidate, status: !answer.ok ? "error" : answer.data ? "available" : "taken" });
        }
      });
    }, DEBOUNCE_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [service, candidate, skip]);

  if (candidate === current) {
    return "unchanged";
  }
  if (!isValidUsername(candidate)) {
    return "invalid";
  }
  return result?.candidate === candidate ? result.status : "checking";
}
