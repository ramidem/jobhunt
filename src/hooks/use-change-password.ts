"use client";

import { accountService } from "@/services/container";

export function useChangePassword() {
  return (email: string, currentPassword: string, newPassword: string) =>
    accountService().changePassword(email, currentPassword, newPassword);
}
