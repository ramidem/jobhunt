import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { fail, ok, type Result } from "@/services/result";

// Talks to Supabase Auth for the session: read it, sign in, sign out, and watch it change.
export function createAuthService(client: SupabaseClient) {
  return {
    async getSession(): Promise<Result<Session | null>> {
      const { data, error } = await client.auth.getSession();
      return error ? fail(error.message) : ok(data.session);
    },

    async signIn(email: string, password: string): Promise<Result<null>> {
      const { error } = await client.auth.signInWithPassword({ email, password });
      return error ? fail(error.message) : ok(null);
    },

    async signOut(): Promise<Result<null>> {
      const { error } = await client.auth.signOut();
      return error ? fail(error.message) : ok(null);
    },

    // Calls the listener on every session change. Returns a function that stops listening.
    onChange(listener: (session: Session | null) => void): () => void {
      const { data } = client.auth.onAuthStateChange((_event, session) => listener(session));
      return () => data.subscription.unsubscribe();
    },
  };
}
