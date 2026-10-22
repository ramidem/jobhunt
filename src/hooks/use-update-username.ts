"use client";

import { profileService } from "@/services/container";

export function useUpdateUsername() {
  return (userId: string, username: string) => profileService().updateUsername(userId, username);
}
