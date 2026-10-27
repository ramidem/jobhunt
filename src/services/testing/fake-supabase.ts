import type { SupabaseClient } from "@supabase/supabase-js";
import { vi } from "vitest";

type Answer = { data?: unknown; error?: { message: string; code?: string } | null };

// A hand-written stand-in for the Supabase client, covering only what the services call.
// Table queries are recorded as arrays like ["eq", "user_id", "u1"] so a test can check exactly
// what was asked. Auth and rpc methods are vi.fn spies; use mockResolvedValueOnce to change an answer.
export function createFakeSupabase() {
  const queryCalls: unknown[][] = [];
  const queuedAnswers: Answer[] = [];
  let queryAnswer: Answer = {};

  const builder: Record<string, unknown> = {};
  for (const method of ["select", "insert", "update", "eq", "order", "maybeSingle", "single"]) {
    builder[method] = (...args: unknown[]) => {
      queryCalls.push([method, ...args]);
      return builder;
    };
  }
  // The builder is awaitable, so both `await ...maybeSingle()` and `await ...eq()` resolve to the answer.
  builder.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => {
    const next = queuedAnswers.length > 0 ? queuedAnswers.shift() : queryAnswer;
    return Promise.resolve({ data: null, error: null, ...next }).then(resolve, reject);
  };

  const fake = {
    from: vi.fn((table: string) => {
      queryCalls.push(["from", table]);
      return builder;
    }),
    rpc: vi.fn<(name: string, args?: unknown) => Promise<Answer>>(async () => ({ data: null, error: null })),
    auth: {
      getSession: vi.fn<() => Promise<{ data: { session: unknown }; error: Answer["error"] }>>(async () => ({
        data: { session: null },
        error: null,
      })),
      signInWithPassword: vi.fn<(credentials: unknown) => Promise<{ error: Answer["error"] }>>(async () => ({
        error: null,
      })),
      signOut: vi.fn<() => Promise<{ error: Answer["error"] }>>(async () => ({ error: null })),
      updateUser: vi.fn<(attributes: unknown) => Promise<{ error: Answer["error"] }>>(async () => ({ error: null })),
      onAuthStateChange: vi.fn<(listener: (event: string, session: unknown) => void) => unknown>(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  };

  return {
    fake,
    client: fake as unknown as SupabaseClient,
    queryCalls,
    answerQuery: (answer: Answer) => {
      queryAnswer = answer;
    },
    // Answers the next awaited query, then the one after that. Falls back to answerQuery.
    answerQueryOnce: (answer: Answer) => {
      queuedAnswers.push(answer);
    },
  };
}
