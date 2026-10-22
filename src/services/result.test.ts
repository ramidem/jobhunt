import { describe, expect, it } from "vitest";
import { fail, ok } from "@/services/result";

describe("Result helpers", () => {
  it("ok wraps data", () => {
    expect(ok(42)).toEqual({ ok: true, data: 42 });
  });

  it("fail wraps an error message", () => {
    expect(fail("nope")).toEqual({ ok: false, error: "nope" });
  });
});
