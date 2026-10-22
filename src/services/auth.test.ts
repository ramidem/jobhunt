import { describe, expect, it, vi } from "vitest";
import { createAuthService } from "@/services/auth";
import { createFakeSupabase } from "@/services/testing/fake-supabase";

const session = { access_token: "token", user: { id: "user-1" } };

describe("auth service", () => {
  describe("getSession", () => {
    it("returns the current session", async () => {
      const { client, fake } = createFakeSupabase();
      fake.auth.getSession.mockResolvedValueOnce({ data: { session }, error: null });

      expect(await createAuthService(client).getSession()).toEqual({ ok: true, data: session });
    });

    it("returns null when signed out", async () => {
      const { client } = createFakeSupabase();

      expect(await createAuthService(client).getSession()).toEqual({ ok: true, data: null });
    });

    it("returns the error message on failure", async () => {
      const { client, fake } = createFakeSupabase();
      fake.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: { message: "bad token" } });

      expect(await createAuthService(client).getSession()).toEqual({ ok: false, error: "bad token" });
    });
  });

  describe("signIn", () => {
    it("passes the email and password to Supabase", async () => {
      const { client, fake } = createFakeSupabase();

      const result = await createAuthService(client).signIn("a@example.com", "secret");

      expect(result).toEqual({ ok: true, data: null });
      expect(fake.auth.signInWithPassword).toHaveBeenCalledWith({ email: "a@example.com", password: "secret" });
    });

    it("returns the error message when sign-in fails", async () => {
      const { client, fake } = createFakeSupabase();
      fake.auth.signInWithPassword.mockResolvedValueOnce({ error: { message: "Invalid login credentials" } });

      expect(await createAuthService(client).signIn("a@example.com", "wrong")).toEqual({
        ok: false,
        error: "Invalid login credentials",
      });
    });
  });

  describe("signOut", () => {
    it("signs out", async () => {
      const { client, fake } = createFakeSupabase();

      expect(await createAuthService(client).signOut()).toEqual({ ok: true, data: null });
      expect(fake.auth.signOut).toHaveBeenCalledOnce();
    });

    it("returns the error message on failure", async () => {
      const { client, fake } = createFakeSupabase();
      fake.auth.signOut.mockResolvedValueOnce({ error: { message: "offline" } });

      expect(await createAuthService(client).signOut()).toEqual({ ok: false, error: "offline" });
    });
  });

  describe("onChange", () => {
    it("gives the listener each session and stops listening on request", () => {
      const { client, fake } = createFakeSupabase();
      const unsubscribe = vi.fn();
      let notify: (event: string, session: unknown) => void = () => {};
      fake.auth.onAuthStateChange.mockImplementationOnce((listener) => {
        notify = listener;
        return { data: { subscription: { unsubscribe } } };
      });
      const listener = vi.fn();

      const stop = createAuthService(client).onChange(listener);
      notify("SIGNED_IN", session);
      notify("SIGNED_OUT", null);

      expect(listener).toHaveBeenNthCalledWith(1, session);
      expect(listener).toHaveBeenNthCalledWith(2, null);

      stop();
      expect(unsubscribe).toHaveBeenCalledOnce();
    });
  });
});
