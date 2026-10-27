import { describe, expect, it } from "vitest";
import { parseExtractionPayload } from "@/lib/extraction";

const valid = {
  skills: { required: ["TypeScript"], niceToHave: ["SQL"] },
  pay: { minPhp: 80000, maxPhp: 120000 },
  years: 4,
  seniority: "senior",
  engagement: "full-time",
  hiringVia: "direct",
};

describe("parseExtractionPayload", () => {
  it("accepts a complete payload", () => {
    expect(parseExtractionPayload(valid)).toMatchObject(valid);
  });

  it("accepts an empty skill list and needsInfo", () => {
    expect(
      parseExtractionPayload({
        skills: { required: [], niceToHave: ["Figma"] },
        needsInfo: true,
      }),
    ).toMatchObject({ needsInfo: true });
  });

  it("rejects an unknown key", () => {
    expect(() => parseExtractionPayload({ ...valid, extra: true })).toThrow();
  });

  it("rejects a blank skill", () => {
    expect(() =>
      parseExtractionPayload({ skills: { required: ["  "], niceToHave: [] } }),
    ).toThrow(/empty/);
  });

  it("rejects pay min above max", () => {
    expect(() =>
      parseExtractionPayload({
        skills: { required: [], niceToHave: [] },
        pay: { minPhp: 150000, maxPhp: 80000 },
      }),
    ).toThrow(/minPhp/);
  });
});
