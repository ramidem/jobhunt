import { describe, expect, it } from "vitest";
import { createAccountService } from "@/services/account";
import { createFakeSupabase } from "@/services/testing/fake-supabase";

describe("account service", () => {
  describe("changePassword", () => {
    it("verifies the current password, then sets the new one", async () => {
      const { client, fake } = createFakeSupabase();

      const result = await createAccountService(client).changePassword("a@example.com", "old-pass", "new-pass");

      expect(result).toEqual({ ok: true, data: null });
      expect(fake.auth.signInWithPassword).toHaveBeenCalledWith({ email: "a@example.com", password: "old-pass" });
      expect(fake.auth.updateUser).toHaveBeenCalledWith({ password: "new-pass" });
    });

    it("does not change the password when the current one is wrong", async () => {
      const { client, fake } = createFakeSupabase();
      fake.auth.signInWithPassword.mockResolvedValueOnce({ error: { message: "Invalid login credentials" } });

      const result = await createAccountService(client).changePassword("a@example.com", "wrong", "new-pass");

      expect(result).toEqual({ ok: false, error: "Your current password is incorrect." });
      expect(fake.auth.updateUser).not.toHaveBeenCalled();
    });

    it("returns the error when the update fails", async () => {
      const { client, fake } = createFakeSupabase();
      fake.auth.updateUser.mockResolvedValueOnce({ error: { message: "Password is too weak" } });

      expect(await createAccountService(client).changePassword("a@example.com", "old-pass", "123")).toEqual({
        ok: false,
        error: "Password is too weak",
      });
    });
  });
});
