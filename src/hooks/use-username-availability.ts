"use client";

import { useEffect, useState } from "react";
import { isValidUsername } from "@/lib/username";
import { profileService } from "@/services/container";

export type UsernameStatus = "unchanged" | "invalid" | "checking" | "available" | "taken" | "error";

const DEBOUNCE_MS = 400;

// Checks a username against the database after the user stops typing.
export function useUsernameAvailability(candidate: string, current: string): UsernameStatus {
  const [result, setResult] = useState<{ candidate: string; status: "available" | "taken" | "error" } | null>(null);

  const skip = candidate === current || !isValidUsername(candidate);

  useEffect(() => {
    if (skip) {
      return;
    }
    let stale = false;
    const timer = setTimeout(() => {
      profileService()
        .isUsernameAvailable(candidate).then((answer) => {
        if (!stale) {
          setResult({ candidate, status: !answer.ok ? "error" : answer.data ? "available" : "taken" });
        }
      });
    }, DEBOUNCE_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [candidate, skip]);

  if (candidate === current) {
    return "unchanged";
  }
  if (!isValidUsername(candidate)) {
    return "invalid";
  }
  return result?.candidate === candidate ? result.status : "checking";
}
