// @vitest-environment jsdom
import type { Session } from "@supabase/supabase-js";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRedirectOnSignOut } from "@/hooks/use-redirect-on-sign-out";

const navigation = vi.hoisted(() => ({ replace: vi.fn(), pathname: "/settings" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace }),
  usePathname: () => navigation.pathname,
}));

const session = { access_token: "token" } as Session;

function render(initial: Session | null) {
  return renderHook(({ value }) => useRedirectOnSignOut(value), { initialProps: { value: initial } });
}

describe("useRedirectOnSignOut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigation.pathname = "/settings";
  });

  it("sends the user to / when their session ends", () => {
    const { rerender } = render(session);

    rerender({ value: null });

    expect(navigation.replace).toHaveBeenCalledWith("/");
  });

  it("does nothing for a visitor who was never signed in", () => {
    const { rerender } = render(null);

    rerender({ value: null });

    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("does not redirect when already on /", () => {
    navigation.pathname = "/";
    const { rerender } = render(session);

    rerender({ value: null });

    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("redirects only once per sign-out", () => {
    const { rerender } = render(session);

    rerender({ value: null });
    rerender({ value: null });

    expect(navigation.replace).toHaveBeenCalledOnce();
  });
});
