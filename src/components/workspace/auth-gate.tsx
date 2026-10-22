"use client";

import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const SessionContext = createContext<Session | null>(null);

export function useSession() {
  return useContext(SessionContext);
}

// Gates the private workspace behind a Supabase email and password session.
// Without Supabase env vars it only renders the children in development; a production build fails closed.
export function AuthGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const configured = isSupabaseConfigured();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!configured);

  useEffect(() => {
    if (!configured) {
      return;
    }
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      // Signing out (or an expired session) sends you to the sign-in page at /.
      if (event === "SIGNED_OUT" && window.location.pathname !== "/") {
        router.replace("/");
      }
    });
    return () => data.subscription.unsubscribe();
  }, [configured, router]);

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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    const { error: failure } = await getSupabase().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (failure) {
      setError(failure.message);
    }
    setBusy(false);
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
  if (!isSupabaseConfigured()) {
    return null;
  }
  return (
    <button className={className} onClick={() => getSupabase().auth.signOut()} type="button">
      Sign out
    </button>
  );
}
