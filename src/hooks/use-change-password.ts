"use client";

import { useMemo } from "react";
import { getSupabase } from "@/lib/supabase";
import { createAccountService } from "@/services/account";

export function useChangePassword() {
  const service = useMemo(() => createAccountService(getSupabase()), []);
  return (email: string, currentPassword: string, newPassword: string) =>
    service.changePassword(email, currentPassword, newPassword);
}
