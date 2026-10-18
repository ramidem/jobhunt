"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // Storage unavailable or corrupt; fall back to the initial value.
    }
    setReady(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(previous) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Ignore write failures (private mode, quota).
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, ready] as const;
}
