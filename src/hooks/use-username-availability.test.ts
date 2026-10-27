// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUsernameAvailability } from "@/hooks/use-username-availability";

const profile = vi.hoisted(() => ({ isUsernameAvailable: vi.fn() }));
vi.mock("@/services/container", () => ({ profileService: () => profile }));

// Lets the debounce timer fire and the availability answer land.
const settle = () => act(() => vi.advanceTimersByTimeAsync(400));

describe("useUsernameAvailability", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    profile.isUsernameAvailable.mockResolvedValue({ ok: true, data: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports unchanged without asking the database", async () => {
    const { result } = renderHook(() => useUsernameAvailability("ramidem", "ramidem"));
    await settle();

    expect(result.current).toBe("unchanged");
    expect(profile.isUsernameAvailable).not.toHaveBeenCalled();
  });

  it("reports invalid without asking the database", async () => {
    const { result } = renderHook(() => useUsernameAvailability("a--b", "ramidem"));
    await settle();

    expect(result.current).toBe("invalid");
    expect(profile.isUsernameAvailable).not.toHaveBeenCalled();
  });

  it("is checking until the debounce passes, then available", async () => {
    const { result } = renderHook(() => useUsernameAvailability("new-name", "ramidem"));

    expect(result.current).toBe("checking");
    await settle();

    expect(result.current).toBe("available");
    expect(profile.isUsernameAvailable).toHaveBeenCalledWith("new-name");
  });

  it("reports taken and error answers", async () => {
    profile.isUsernameAvailable.mockResolvedValueOnce({ ok: true, data: false });
    const taken = renderHook(() => useUsernameAvailability("taken", "ramidem"));
    await settle();
    expect(taken.result.current).toBe("taken");

    profile.isUsernameAvailable.mockResolvedValueOnce({ ok: false, error: "network down" });
    const failed = renderHook(() => useUsernameAvailability("other", "ramidem"));
    await settle();
    expect(failed.result.current).toBe("error");
  });

  it("only checks the name the user stopped typing on", async () => {
    const { result, rerender } = renderHook(({ name }) => useUsernameAvailability(name, "ramidem"), {
      initialProps: { name: "new" },
    });
    await act(() => vi.advanceTimersByTimeAsync(200));
    rerender({ name: "new-name" });
    await settle();

    expect(profile.isUsernameAvailable).toHaveBeenCalledOnce();
    expect(profile.isUsernameAvailable).toHaveBeenCalledWith("new-name");
    expect(result.current).toBe("available");
  });

  it("does not show an answer for an earlier name", async () => {
    const { result, rerender } = renderHook(({ name }) => useUsernameAvailability(name, "ramidem"), {
      initialProps: { name: "first" },
    });
    await settle();
    rerender({ name: "second" });

    expect(result.current).toBe("checking");
  });
});
