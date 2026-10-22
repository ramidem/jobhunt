"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { authService } from "@/services/container";

type AuthState = { session: Session | null; ready: boolean };

// Follows the Supabase session. ready turns true once the first answer is known.
// Pass enabled=false when auth is not configured; the hook then does nothing.
export function useAuthSession(enabled: boolean): AuthState {
  const [state, setState] = useState<AuthState>({ session: null, ready: false });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let stale = false;
    const service = authService();
    service.getSession().then((result) => {
      if (!stale) {
        setState({ session: result.ok ? result.data : null, ready: true });
      }
    });
    const stopListening = service.onChange((session) => setState({ session, ready: true }));
    return () => {
      stale = true;
      stopListening();
    };
  }, [enabled]);

  return enabled ? state : { session: null, ready: true };
}
