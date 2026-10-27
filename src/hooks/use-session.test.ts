// @vitest-environment jsdom
import type { Session } from "@supabase/supabase-js";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { SessionContext, useSession } from "@/hooks/use-session";

describe("useSession", () => {
  it("is null outside a provider", () => {
    expect(renderHook(() => useSession()).result.current).toBeNull();
  });

  it("returns the provided session", () => {
    const session = { access_token: "token" } as Session;
    const { result } = renderHook(() => useSession(), {
      wrapper: ({ children }: { children: ReactNode }) => createElement(SessionContext.Provider, { value: session }, children),
    });

    expect(result.current).toBe(session);
  });
});
