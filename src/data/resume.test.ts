import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { resume } from "@/data/resume";

describe("public resume", () => {
  it("does not carry a phone number or email", () => {
    expect(resume).not.toHaveProperty("phone");
    expect(resume).not.toHaveProperty("email");
    const published = JSON.stringify(resume);
    expect(published).not.toMatch(/@/);
    expect(published).not.toMatch(/\+\d/);

    const source = readFileSync(resolve("src/data/resume.ts"), "utf8");
    expect(source).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(source).not.toMatch(/\+\d/);
  });

  it("does not keep a public /api/resume route", () => {
    expect(existsSync(resolve("src/app/api/resume/route.ts"))).toBe(false);
  });

  it("does not advertise /api/resume in the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => url.includes("/api/resume"))).toBe(false);
    expect(urls.length).toBeGreaterThan(0);
  });
});
