"use client";

import type { Session } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Sends the user to the sign-in page at / when a session they had ends (sign-out or expiry).
export function useRedirectOnSignOut(session: Session | null) {
  const router = useRouter();
  const pathname = usePathname();
  const hadSession = useRef(false);

  useEffect(() => {
    if (session) {
      hadSession.current = true;
      return;
    }
    if (hadSession.current) {
      hadSession.current = false;
      if (pathname !== "/") {
        router.replace("/");
      }
    }
  }, [session, pathname, router]);
}
