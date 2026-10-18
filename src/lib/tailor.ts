import type { Resume } from "@/lib/resume-schema";

// Canonical term -> aliases. Matching is case-insensitive on word boundaries.
const TERMS: Record<string, string[]> = {
  TypeScript: ["typescript"],
  JavaScript: ["javascript", "ecmascript", "es6"],
  Python: [],
  Java: [],
  Go: ["golang"],
  Rust: [],
  "C#": ["csharp", "c-sharp"],
  ".NET": ["dotnet", "asp.net"],
  "C++": ["cpp"],
  Ruby: ["rails", "ruby on rails"],
  PHP: ["laravel"],
  Kotlin: [],
  Swift: [],
  SQL: [],
  React: ["react.js", "reactjs"],
  "Next.js": ["nextjs", "next js"],
  "Node.js": ["node", "nodejs", "node js"],
  NestJS: ["nest.js", "nest js"],
  Express: ["express.js", "expressjs"],
  Vue: ["vue.js", "vuejs"],
  Angular: [],
  Svelte: [],
  HTML: ["html5"],
  CSS: ["css3", "sass", "scss"],
  Tailwind: ["tailwindcss", "tailwind css"],
  GraphQL: [],
  REST: ["restful", "rest api", "rest apis"],
  gRPC: [],
  Strapi: [],
  Contentful: [],
  Firebase: [],
  Firestore: [],
  PostgreSQL: ["postgres"],
  MySQL: [],
  MongoDB: ["mongo"],
  Redis: [],
  "Drizzle ORM": ["drizzle"],
  Prisma: [],
  "Google Cloud": ["gcp", "google cloud platform"],
  AWS: ["amazon web services", "lambda", "s3", "ec2"],
  Azure: [],
  Vercel: [],
  Docker: ["containers", "containerization"],
  Kubernetes: ["k8s"],
  Terraform: [],
  "CI/CD": ["ci cd", "continuous integration", "continuous delivery", "github actions", "jenkins"],
  Git: ["github", "gitlab"],
  Linux: [],
  Testing: ["unit testing", "integration testing", "jest", "vitest", "cypress", "playwright", "tdd"],
  Agile: ["scrum", "kanban"],
  Microservices: ["microservice"],
  "AI / LLM": ["llm", "llms", "generative ai", "genai", "openai", "prompt engineering"],
  "Machine Learning": ["tensorflow", "pytorch"],
  OAuth: ["jwt", "sso"],
  RBAC: ["casl", "access control"],
  Stripe: [],
  SendGrid: [],
  Konva: [],
  Zod: [],
  Jira: [],
  Salesforce: [],
};

function escape(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

// Terms that are also common English words must match with exact casing.
const CASE_SENSITIVE = new Set(["Go", "Express", "Swift", "Rust", "Ruby"]);

function buildPattern(canonical: string, words: string[]) {
  const body = words.map(escape).join("|");
  const flags = CASE_SENSITIVE.has(canonical) ? "" : "i";
  return new RegExp(`(?<![A-Za-z0-9])(?:${body})(?![A-Za-z0-9])`, flags);
}

const PATTERNS = Object.entries(TERMS).map(([canonical, aliases]) => ({
  canonical,
  pattern: buildPattern(canonical, [canonical, ...aliases]),
}));

export function extractTerms(text: string) {
  return PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ canonical }) => canonical);
}

type Dated = Resume["experience"][number];
type WorkItem = Dated["highlights"][number];

function itemText(item: { bullets: string[]; summary?: string; organization: string; location?: string; role: string }) {
  return [item.organization, item.location ?? "", item.role, item.summary ?? "", ...item.bullets].join(" ");
}

function datedText(item: Dated) {
  return [itemText(item), ...item.highlights.map(itemText)].join(" ");
}

export function resumeText(resume: Resume) {
  return [
    resume.headline,
    resume.summary,
    ...resume.experience.map(datedText),
    ...resume.projects.map(datedText),
    ...resume.leadership.map(datedText),
    ...resume.skills.flatMap((group) => group.items),
  ].join(" ");
}

function score(text: string, jobTerms: Set<string>) {
  return extractTerms(text).filter((term) => jobTerms.has(term)).length;
}

function sortByScore<T>(items: T[], getText: (item: T) => string, jobTerms: Set<string>) {
  return items
    .map((item, index) => ({ item, index, value: score(getText(item), jobTerms) }))
    .sort((a, b) => b.value - a.value || a.index - b.index)
    .map(({ item }) => item);
}

function tailorItem<T extends WorkItem>(item: T, jobTerms: Set<string>): T {
  return {
    ...item,
    // The first bullet leads with the core stack and cloud, so it stays first.
    bullets: [item.bullets[0], ...sortByScore(item.bullets.slice(1), (bullet) => bullet, jobTerms)].filter(
      (bullet): bullet is string => bullet !== undefined,
    ),
  };
}

function tailorDated(item: Dated, jobTerms: Set<string>): Dated {
  const highlights = sortByScore(item.highlights, itemText, jobTerms).map((highlight) =>
    tailorItem(highlight, jobTerms),
  );
  return { ...tailorItem(item, jobTerms), highlights };
}

export type TailorResult = {
  resume: Resume;
  jobTerms: string[];
  matched: string[];
  missing: string[];
  matchPercent: number | null;
};

export function tailorResume(resume: Resume, jobDescription: string): TailorResult {
  const jobTerms = extractTerms(jobDescription);
  const jobSet = new Set(jobTerms);
  const resumeTerms = new Set(extractTerms(resumeText(resume)));
  const matched = jobTerms.filter((term) => resumeTerms.has(term));
  const missing = jobTerms.filter((term) => !resumeTerms.has(term));

  const skills = sortByScore(
    resume.skills.map((group) => ({
      ...group,
      items: sortByScore(group.items, (skill) => skill, jobSet),
    })),
    (group) => group.items.join(" "),
    jobSet,
  );

  const tailored: Resume = {
    ...resume,
    experience: sortByScore(resume.experience, datedText, jobSet).map((item) => tailorDated(item, jobSet)),
    projects: sortByScore(resume.projects, datedText, jobSet).map((item) => tailorDated(item, jobSet)),
    skills,
  };

  return {
    resume: tailored,
    jobTerms,
    matched,
    missing,
    matchPercent: jobTerms.length === 0 ? null : Math.round((matched.length / jobTerms.length) * 100),
  };
}
