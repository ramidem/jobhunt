// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSignIn } from "@/hooks/use-sign-in";

const auth = vi.hoisted(() => ({ signIn: vi.fn() }));
vi.mock("@/services/container", () => ({ authService: () => auth }));

describe("useSignIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.signIn.mockResolvedValue({ ok: true, data: null });
  });

  it("signs in and is busy only while waiting", async () => {
    let answer: (value: unknown) => void = () => {};
    auth.signIn.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)));
    const { result } = renderHook(() => useSignIn());

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.signIn("a@example.com", "secret");
    });
    expect(result.current.busy).toBe(true);
    await act(async () => {
      answer({ ok: true, data: null });
      await pending;
    });

    expect(auth.signIn).toHaveBeenCalledWith("a@example.com", "secret");
    expect(result.current).toMatchObject({ busy: false, error: null });
  });

  it("shows the sign-in error", async () => {
    auth.signIn.mockResolvedValueOnce({ ok: false, error: "Invalid login credentials" });
    const { result } = renderHook(() => useSignIn());

    await act(() => result.current.signIn("a@example.com", "wrong"));

    expect(result.current).toMatchObject({ busy: false, error: "Invalid login credentials" });
  });

  it("clears the last error on a new attempt", async () => {
    auth.signIn.mockResolvedValueOnce({ ok: false, error: "Invalid login credentials" });
    const { result } = renderHook(() => useSignIn());
    await act(() => result.current.signIn("a@example.com", "wrong"));

    await act(() => result.current.signIn("a@example.com", "secret"));

    expect(result.current.error).toBeNull();
  });

  it("does not stay busy when the request throws", async () => {
    auth.signIn.mockRejectedValueOnce(new Error("Failed to fetch"));
    const { result } = renderHook(() => useSignIn());

    await act(() => result.current.signIn("a@example.com", "secret"));

    expect(result.current).toMatchObject({ busy: false, error: "Could not reach the server. Try again." });
  });
});
