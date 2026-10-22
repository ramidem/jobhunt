"use client";

import { authService } from "@/services/container";

export function useSignOut() {
  return () => authService().signOut();
}
