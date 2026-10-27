// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useChangePassword } from "@/hooks/use-change-password";
import { useSignOut } from "@/hooks/use-sign-out";
import { useUpdateUsername } from "@/hooks/use-update-username";

const services = vi.hoisted(() => ({
  auth: { signOut: vi.fn(async () => ({ ok: true, data: null })) },
  profile: { updateUsername: vi.fn(async () => ({ ok: true, data: null })) },
  account: { changePassword: vi.fn(async () => ({ ok: false, error: "Your current password is incorrect." })) },
}));
vi.mock("@/services/container", () => ({
  authService: () => services.auth,
  profileService: () => services.profile,
  accountService: () => services.account,
}));

// These hooks only hand the call to their service and return its result.
describe("account action hooks", () => {
  it("useChangePassword passes the passwords to the account service", async () => {
    const changePassword = renderHook(() => useChangePassword()).result.current;

    expect(await changePassword("a@example.com", "old", "new")).toEqual({
      ok: false,
      error: "Your current password is incorrect.",
    });
    expect(services.account.changePassword).toHaveBeenCalledWith("a@example.com", "old", "new");
  });

  it("useUpdateUsername passes the user and name to the profile service", async () => {
    const updateUsername = renderHook(() => useUpdateUsername()).result.current;

    expect(await updateUsername("user-1", "new-name")).toEqual({ ok: true, data: null });
    expect(services.profile.updateUsername).toHaveBeenCalledWith("user-1", "new-name");
  });

  it("useSignOut signs out through the auth service", async () => {
    const signOut = renderHook(() => useSignOut()).result.current;

    expect(await signOut()).toEqual({ ok: true, data: null });
    expect(services.auth.signOut).toHaveBeenCalledOnce();
  });
});
