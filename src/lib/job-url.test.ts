import { describe, expect, it } from "vitest";
import { normalizeJobUrl } from "@/lib/job-url";

// Same strings as supabase/tests/database/03_job_posts.test.sql, so the client and database normalizers agree.
const cases: [string, string, string][] = [
  ["LinkedIn currentJobId becomes /jobs/view/<id>/", "https://www.linkedin.com/jobs/search/?currentJobId=4389012345&keywords=engineer&utm_source=share&trackingId=abc", "https://www.linkedin.com/jobs/view/4389012345/"],
  ["LinkedIn view link drops tracking params", "https://www.linkedin.com/jobs/view/4389012345/?trackingId=abc&refId=xyz", "https://www.linkedin.com/jobs/view/4389012345/"],
  ["LinkedIn slug view link keeps the numeric id", "https://www.linkedin.com/jobs/view/senior-engineer-at-acme-4389012345/", "https://www.linkedin.com/jobs/view/4389012345/"],
  ["LinkedIn country host canonicalizes to www", "https://ph.linkedin.com/jobs/view/4389012345", "https://www.linkedin.com/jobs/view/4389012345/"],
  ["LinkedIn collection link uses currentJobId", "http://linkedin.com/jobs/collections/recommended/?currentJobId=4389012345", "https://www.linkedin.com/jobs/view/4389012345/"],
  ["host, scheme and default port are normalized and tracking params drop", "HTTPS://Example.com:443/Jobs/?utm_source=x&b=2&a=1", "https://example.com/Jobs?a=1&b=2"],
  ["trailing slash and utm params are removed", "https://example.com/jobs/1/?id=9&utm_campaign=spring", "https://example.com/jobs/1?id=9"],
  ["fbclid is tracking and spaces use form encoding", "https://example.com/jobs/?q=a%20b&fbclid=zzz", "https://example.com/jobs?q=a+b"],
  ["plus in a query value is a space", "https://example.com/jobs/?q=a+b", "https://example.com/jobs?q=a+b"],
  ["a non-tracking job id stays on the link", "https://boards.greenhouse.io/acme/jobs/123?gh_jid=123&utm_source=li", "https://boards.greenhouse.io/acme/jobs/123?gh_jid=123"],
  ["fragment is dropped", "https://example.com/path#frag", "https://example.com/path"],
  ["a bare host keeps a single slash", "https://example.com", "https://example.com/"],
  ["currentJobId wins when the view path is a different id", "https://www.linkedin.com/jobs/view/123/?currentJobId=999", "https://www.linkedin.com/jobs/view/999/"],
  ["a non-default port is kept", "https://example.com:8443/jobs/", "https://example.com:8443/jobs"],
  ["userinfo is dropped", "https://user:pass@example.com/secret", "https://example.com/secret"],
  ["a slash in a query value stays percent-encoded", "https://example.com/jobs?q=a%2Fb", "https://example.com/jobs?q=a%2Fb"],
  ["a star in a query value stays unescaped", "https://example.com/jobs?q=a*b", "https://example.com/jobs?q=a*b"],
  ["a tilde in a query value is percent-encoded", "https://example.com/jobs?q=a~b", "https://example.com/jobs?q=a%7Eb"],
  ["query params are sorted by key then value", "https://example.com/jobs?b=1&a=2&a=1", "https://example.com/jobs?a=1&a=2&b=1"],
];

const rejected: [string, string][] = [
  ["ftp is rejected", "ftp://example.com/jobs"],
  ["plain text is rejected", "not a url"],
  ["a blank link is rejected", "  "],
  ["a link with a tab inside is rejected", "https://example.com/a\tb"],
  ["a link with no host is rejected", "https:///jobs"],
  ["a host with an underscore is rejected", "https://bad_host.com/"],
  ["a query with invalid UTF-8 is rejected", "https://example.com/?q=%FF"],
];

describe("normalizeJobUrl", () => {
  it.each(cases)("%s", (_name, url, expected) => {
    expect(normalizeJobUrl(url)).toBe(expected);
  });

  it.each(rejected)("%s", (_name, url) => {
    expect(normalizeJobUrl(url)).toBeNull();
  });

  it("trims surrounding spaces", () => {
    expect(normalizeJobUrl("  https://example.com/jobs/  ")).toBe("https://example.com/jobs");
  });

  it("drops all params when every one is tracking", () => {
    expect(normalizeJobUrl("https://example.com/jobs?utm_source=x&gclid=y")).toBe("https://example.com/jobs");
  });

  it("keeps a stray percent sign as a literal", () => {
    expect(normalizeJobUrl("https://example.com/?q=100%")).toBe("https://example.com/?q=100%25");
  });

  it("re-encodes non-ASCII values as UTF-8", () => {
    expect(normalizeJobUrl("https://example.com/?city=Cebú")).toBe("https://example.com/?city=Ceb%C3%BA");
  });
});
