import type { SupabaseClient } from "@supabase/supabase-js";
import { fail, ok, type Result } from "@/services/result";

export type Profile = { username: string; displayName: string };

// Postgres error codes the database raises for username rules.
const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";

// Talks to the profiles table. The client is passed in, so tests can supply a fake one.
export function createProfileService(client: SupabaseClient) {
  return {
    async getOwn(userId: string): Promise<Result<Profile | null>> {
      const { data, error } = await client
        .from("profiles")
        .select("username, display_name")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        return fail(error.message);
      }
      return ok(data ? { username: data.username, displayName: data.display_name } : null);
    },

    async isUsernameAvailable(candidate: string): Promise<Result<boolean>> {
      const { data, error } = await client.rpc("username_available", { candidate });
      return error ? fail(error.message) : ok(Boolean(data));
    },

    async updateUsername(userId: string, username: string): Promise<Result<null>> {
      const { error } = await client.from("profiles").update({ username }).eq("user_id", userId);
      if (!error) {
        return ok(null);
      }
      if (error.code === UNIQUE_VIOLATION) {
        return fail("That username is already taken.");
      }
      if (error.code === CHECK_VIOLATION) {
        return fail("That username is not allowed.");
      }
      return fail(error.message);
    },
  };
}
