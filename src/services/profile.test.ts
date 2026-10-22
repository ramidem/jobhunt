import { describe, expect, it } from "vitest";
import { createProfileService } from "@/services/profile";
import { createFakeSupabase } from "@/services/testing/fake-supabase";

describe("profile service", () => {
  describe("getOwn", () => {
    it("maps the row to a profile and asks for the user's own row", async () => {
      const { client, queryCalls, answerQuery } = createFakeSupabase();
      answerQuery({ data: { username: "ramidem", display_name: "Med" } });

      const result = await createProfileService(client).getOwn("user-1");

      expect(result).toEqual({ ok: true, data: { username: "ramidem", displayName: "Med" } });
      expect(queryCalls).toEqual([
        ["from", "profiles"],
        ["select", "username, display_name"],
        ["eq", "user_id", "user-1"],
        ["maybeSingle"],
      ]);
    });

    it("returns null when the user has no profile row", async () => {
      const { client, answerQuery } = createFakeSupabase();
      answerQuery({ data: null });

      expect(await createProfileService(client).getOwn("user-1")).toEqual({ ok: true, data: null });
    });

    it("returns the database error message", async () => {
      const { client, answerQuery } = createFakeSupabase();
      answerQuery({ error: { message: "permission denied" } });

      expect(await createProfileService(client).getOwn("user-1")).toEqual({ ok: false, error: "permission denied" });
    });
  });

  describe("isUsernameAvailable", () => {
    it("calls the username_available function with the candidate", async () => {
      const { client, fake } = createFakeSupabase();
      fake.rpc.mockResolvedValueOnce({ data: true, error: null });

      const result = await createProfileService(client).isUsernameAvailable("new-name");

      expect(result).toEqual({ ok: true, data: true });
      expect(fake.rpc).toHaveBeenCalledWith("username_available", { candidate: "new-name" });
    });

    it("reports a taken name as false", async () => {
      const { client, fake } = createFakeSupabase();
      fake.rpc.mockResolvedValueOnce({ data: false, error: null });

      expect(await createProfileService(client).isUsernameAvailable("taken")).toEqual({ ok: true, data: false });
    });

    it("returns the error message when the call fails", async () => {
      const { client, fake } = createFakeSupabase();
      fake.rpc.mockResolvedValueOnce({ data: null, error: { message: "network down" } });

      expect(await createProfileService(client).isUsernameAvailable("x")).toEqual({ ok: false, error: "network down" });
    });
  });

  describe("updateUsername", () => {
    it("updates only the user's own row", async () => {
      const { client, queryCalls } = createFakeSupabase();

      const result = await createProfileService(client).updateUsername("user-1", "new-name");

      expect(result).toEqual({ ok: true, data: null });
      expect(queryCalls).toEqual([
        ["from", "profiles"],
        ["update", { username: "new-name" }],
        ["eq", "user_id", "user-1"],
      ]);
    });

    it("turns a unique violation into a taken message", async () => {
      const { client, answerQuery } = createFakeSupabase();
      answerQuery({ error: { code: "23505", message: "duplicate key" } });

      expect(await createProfileService(client).updateUsername("user-1", "bob")).toEqual({
        ok: false,
        error: "That username is already taken.",
      });
    });

    it("turns a check violation into a not-allowed message", async () => {
      const { client, answerQuery } = createFakeSupabase();
      answerQuery({ error: { code: "23514", message: "username_reserved" } });

      expect(await createProfileService(client).updateUsername("user-1", "settings")).toEqual({
        ok: false,
        error: "That username is not allowed.",
      });
    });

    it("passes any other error message through", async () => {
      const { client, answerQuery } = createFakeSupabase();
      answerQuery({ error: { code: "XX000", message: "boom" } });

      expect(await createProfileService(client).updateUsername("user-1", "name")).toEqual({
        ok: false,
        error: "boom",
      });
    });
  });
});
