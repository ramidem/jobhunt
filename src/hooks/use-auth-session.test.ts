// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthSession } from "@/hooks/use-auth-session";

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  onChange: vi.fn(),
}));
vi.mock("@/services/container", () => ({ authService: () => auth }));

const session = { access_token: "token", user: { id: "user-1" } };

describe("useAuthSession", () => {
  let notify: (value: unknown) => void;
  const stopListening = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    auth.getSession.mockResolvedValue({ ok: true, data: session });
    auth.onChange.mockImplementation((listener) => {
      notify = listener;
      return stopListening;
    });
  });

  it("does nothing and reports ready when disabled", () => {
    const { result } = renderHook(() => useAuthSession(false));

    expect(result.current).toEqual({ session: null, ready: true });
    expect(auth.getSession).not.toHaveBeenCalled();
  });

  it("is not ready until the first session answer", async () => {
    const { result } = renderHook(() => useAuthSession(true));

    expect(result.current.ready).toBe(false);
    await waitFor(() => expect(result.current).toEqual({ session, ready: true }));
  });

  it("treats a failed session read as signed out", async () => {
    auth.getSession.mockResolvedValueOnce({ ok: false, error: "bad token" });

    const { result } = renderHook(() => useAuthSession(true));

    await waitFor(() => expect(result.current).toEqual({ session: null, ready: true }));
  });

  it("follows session changes", async () => {
    const { result } = renderHook(() => useAuthSession(true));
    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => notify(null));

    expect(result.current).toEqual({ session: null, ready: true });
  });

  it("stops listening and ignores a late answer after unmount", async () => {
    let answer: (value: unknown) => void = () => {};
    auth.getSession.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)));
    const { result, unmount } = renderHook(() => useAuthSession(true));

    unmount();
    await act(async () => answer({ ok: true, data: session }));

    expect(stopListening).toHaveBeenCalledOnce();
    expect(result.current.ready).toBe(false);
  });
});
