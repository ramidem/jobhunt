import type { SupabaseClient } from "@supabase/supabase-js";
import { fail, ok, type Result } from "@/services/result";

// Talks to Supabase Auth for the signed-in user's account.
export function createAccountService(client: SupabaseClient) {
  return {
    // Verifies the current password first, so a stolen session alone cannot change it.
    async changePassword(email: string, currentPassword: string, newPassword: string): Promise<Result<null>> {
      const verified = await client.auth.signInWithPassword({ email, password: currentPassword });
      if (verified.error) {
        return fail("Your current password is incorrect.");
      }
      const { error } = await client.auth.updateUser({ password: newPassword });
      return error ? fail(error.message) : ok(null);
    },
  };
}
