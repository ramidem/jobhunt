"use client";

import { useState } from "react";
import { authService } from "@/services/container";

export function useSignIn() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn(email: string, password: string) {
    setBusy(true);
    setError(null);
    const result = await authService().signIn(email, password);
    if (!result.ok) {
      setError(result.error);
    }
    setBusy(false);
  }

  return { signIn, busy, error };
}
