import { getSupabase } from "@/lib/supabase";
import { createAccountService } from "@/services/account";
import { createAuthService } from "@/services/auth";
import { createProfileService } from "@/services/profile";
import { createResumeContactService } from "@/services/resume-contact";

// The one place services are wired to the real Supabase client. Created on first use, so nothing
// touches Supabase while rendering or when it is not configured.
let auth: ReturnType<typeof createAuthService> | undefined;
let profile: ReturnType<typeof createProfileService> | undefined;
let account: ReturnType<typeof createAccountService> | undefined;
let resumeContact: ReturnType<typeof createResumeContactService> | undefined;

export const authService = () => (auth ??= createAuthService(getSupabase()));
export const profileService = () => (profile ??= createProfileService(getSupabase()));
export const accountService = () => (account ??= createAccountService(getSupabase()));
export const resumeContactService = () => (resumeContact ??= createResumeContactService(getSupabase()));
