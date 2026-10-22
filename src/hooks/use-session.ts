"use client";

import type { Session } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

// The signed-in session, provided by AuthGate. null when auth is not configured (development only).
export const SessionContext = createContext<Session | null>(null);

export function useSession() {
  return useContext(SessionContext);
}
