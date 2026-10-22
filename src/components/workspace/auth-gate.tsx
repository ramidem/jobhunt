"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useRedirectOnSignOut } from "@/hooks/use-redirect-on-sign-out";
import { SessionContext } from "@/hooks/use-session";
import { useSignIn } from "@/hooks/use-sign-in";
import { useSignOut } from "@/hooks/use-sign-out";
import { isSupabaseConfigured } from "@/lib/supabase";

// Gates the private workspace behind a Supabase email and password session.
// Without Supabase env vars it only renders the children in development; a production build fails closed.
export function AuthGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const configured = isSupabaseConfigured();
  const { session, ready } = useAuthSession(configured);
  useRedirectOnSignOut(session);

  if (!configured) {
    return process.env.NODE_ENV === "production" ? <NotConfigured /> : children;
  }
  if (session) {
    return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
  }
  return ready ? <SignIn /> : null;
}

function NotConfigured() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <p className="max-w-sm text-sm text-muted-foreground" role="alert">
        Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then rebuild.
      </p>
    </div>
  );
}

function SignIn() {
  const { signIn, busy, error } = useSignIn();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    signIn(String(form.get("email")), String(form.get("password")));
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <form className="grid w-full max-w-sm gap-4 rounded-xl border bg-background p-6" onSubmit={submit}>
        <h1 className="text-lg font-semibold tracking-tight">Job hunt workspace</h1>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input autoComplete="email" id="email" name="email" required type="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input autoComplete="current-password" id="password" name="password" required type="password" />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button disabled={busy} type="submit">
          {busy ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

export function SignOutButton({ className }: Readonly<{ className?: string }>) {
  const signOut = useSignOut();
  if (!isSupabaseConfigured()) {
    return null;
  }
  return (
    <button className={className} onClick={signOut} type="button">
      Sign out
    </button>
  );
}
