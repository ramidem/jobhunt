import { describe, expect, it } from "vitest";
import { isValidUsername, normalizeUsername } from "@/lib/username";

// Same rule as the profiles.username check in supabase/migrations/*_profiles_and_usernames.sql.
describe("normalizeUsername", () => {
  it("trims and lowercases", () => {
    expect(normalizeUsername("  RamiDem ")).toBe("ramidem");
  });
});

describe("isValidUsername", () => {
  it.each(["abc", "ramidem", "med-aduh", "a1-b2-c3", "123", "a".repeat(30)])("accepts %s", (name) => {
    expect(isValidUsername(name)).toBe(true);
  });

  it.each([
    ["too short", "ab"],
    ["too long", "a".repeat(31)],
    ["uppercase", "Ramidem"],
    ["leading hyphen", "-abc"],
    ["trailing hyphen", "abc-"],
    ["double hyphen", "a--b"],
    ["underscore", "a_b"],
    ["space", "a b"],
    ["dot", "a.b"],
    ["empty", ""],
  ])("rejects %s", (_reason, name) => {
    expect(isValidUsername(name)).toBe(false);
  });
});
