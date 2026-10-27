import type { SupabaseClient } from "@supabase/supabase-js";
import { fail, ok, type Result } from "@/services/result";

export type ResumeContact = {
  email: string | null;
  phone: string | null;
};

// Reads the signed-in user's private resume contact. The client is passed in so tests can use a fake.
// The database allows select only where user_id = auth.uid(); this filter asks for that row.
export function createResumeContactService(client: SupabaseClient) {
  return {
    async getOwn(userId: string): Promise<Result<ResumeContact | null>> {
      const { data, error } = await client
        .from("resume_contact")
        .select("email, phone")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        return fail(error.message);
      }
      if (!data) {
        return ok(null);
      }
      return ok({ email: data.email, phone: data.phone });
    },
  };
}
