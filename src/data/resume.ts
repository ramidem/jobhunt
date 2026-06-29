import { resumeSchema, type Resume } from "@/lib/resume-schema";

const draftResume = {
  name: "Med Aduh",
  headline: "Software Engineer",
  location: "Manila, Philippines / Remote",
  email: "im.ramidem@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/ramidem" },
    { label: "Resume", href: "https://github.com/ramidem/resume" },
  ],
  summary:
    "Software engineer focused on reliable web systems, developer tooling, and product workflows. This resume is structured for evidence-backed updates from GitHub repositories and production project history.",
  education: [
    {
      institution: "Resume details pending",
      location: "To be updated",
      degree: "Education section ready for verified entries",
      dates: "TBD",
      details: [
        "Replace this entry after reviewing source documents or confirmed profile details.",
      ],
    },
  ],
  experience: [
    {
      organization: "Independent software work",
      location: "Remote",
      role: "Software Engineer",
      start: "TBD",
      end: "Present",
      summary: "Placeholder entry pending repository audit.",
      bullets: [
        "Built and maintained full-stack product workflows across local-first, cloud-backed, and automation-heavy applications.",
        "Improved developer feedback loops through typed data models, verification scripts, and deployment-ready project structure.",
        "Translated product requirements into maintainable implementation plans with clear release and quality gates.",
      ],
      links: [{ label: "GitHub profile", href: "https://github.com/ramidem" }],
    },
  ],
  projects: [
    {
      organization: "Public resume system",
      location: "Next.js / Firebase",
      role: "Creator",
      start: "2026",
      end: "Present",
      summary:
        "A public, mobile-friendly, ATS-readable resume site with downloadable PDF and message capture.",
      bullets: [
        "Modeled resume content with Zod so future GitHub-derived entries can be validated before publishing.",
        "Rendered the same structured content to responsive HTML, JSON API, and text-based PDF output.",
        "Added analytics and Firebase-ready message collection for recruiter and collaborator follow-up.",
      ],
      links: [{ label: "Repository", href: "https://github.com/ramidem/resume" }],
    },
  ],
  leadership: [],
  skills: [
    {
      label: "Languages",
      items: ["TypeScript", "JavaScript", "SQL"],
    },
    {
      label: "Web",
      items: ["Next.js", "React", "Node.js", "Zod"],
    },
    {
      label: "Cloud & data",
      items: ["Firebase", "Firestore", "Vercel"],
    },
    {
      label: "Practices",
      items: ["Full-stack architecture", "developer tooling", "testing", "automation"],
    },
  ],
  interests: ["Product systems", "developer experience", "automation"],
  updatedAt: new Date("2026-06-29T00:00:00.000Z").toISOString(),
} satisfies Resume;

export const resume = resumeSchema.parse(draftResume);
