"use client";

import { useMemo } from "react";
import { getSupabase } from "@/lib/supabase";
import { createProfileService } from "@/services/profile";

export function useUpdateUsername() {
  const service = useMemo(() => createProfileService(getSupabase()), []);
  return (userId: string, username: string) => service.updateUsername(userId, username);
}
