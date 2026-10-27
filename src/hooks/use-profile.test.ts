// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProfile } from "@/hooks/use-profile";

const profile = vi.hoisted(() => ({ getOwn: vi.fn() }));
vi.mock("@/services/container", () => ({ profileService: () => profile }));

const med = { username: "ramidem", displayName: "Med" };

describe("useProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    profile.getOwn.mockResolvedValue({ ok: true, data: med });
  });

  it("is undefined while loading, then the user's profile", async () => {
    const { result } = renderHook(() => useProfile("user-1"));

    expect(result.current.profile).toBeUndefined();
    await waitFor(() => expect(result.current.profile).toEqual(med));
    expect(profile.getOwn).toHaveBeenCalledWith("user-1");
  });

  it("is null when the user has no profile row", async () => {
    profile.getOwn.mockResolvedValueOnce({ ok: true, data: null });

    const { result } = renderHook(() => useProfile("user-1"));

    await waitFor(() => expect(result.current.profile).toBeNull());
  });

  it("reports a load error", async () => {
    profile.getOwn.mockResolvedValueOnce({ ok: false, error: "permission denied" });

    const { result } = renderHook(() => useProfile("user-1"));

    await waitFor(() => expect(result.current.error).toBe("permission denied"));
  });

  it("loads again on reload and clears the error", async () => {
    profile.getOwn.mockResolvedValueOnce({ ok: false, error: "offline" });
    const { result } = renderHook(() => useProfile("user-1"));
    await waitFor(() => expect(result.current.error).toBe("offline"));

    act(() => result.current.reload());

    await waitFor(() => expect(result.current).toMatchObject({ profile: med, error: null }));
    expect(profile.getOwn).toHaveBeenCalledTimes(2);
  });

  it("ignores the answer for a previous user", async () => {
    let answerOld: (value: unknown) => void = () => {};
    profile.getOwn.mockReturnValueOnce(new Promise((resolve) => (answerOld = resolve)));
    const { result, rerender } = renderHook(({ userId }) => useProfile(userId), { initialProps: { userId: "old" } });

    rerender({ userId: "new" });
    await waitFor(() => expect(result.current.profile).toEqual(med));
    await act(async () => answerOld({ ok: true, data: { username: "old", displayName: "" } }));

    expect(result.current.profile).toEqual(med);
  });
});
