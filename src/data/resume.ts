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
    "Software engineer focused on reliable web systems, product workflows, and practical tooling. This public profile highlights evidence-backed notable work; tailored resumes can be generated from the project records for each role.",
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
      organization: "Gussy",
      location: "Firebase / React / Konva",
      role: "Contributing Software Engineer",
      start: "Nov 2020",
      end: "Mar 2021",
      summary:
        "Interior design and commerce platform with designer tools, PM/admin workflows, client review, public shopping, checkout, and order management.",
      bullets: [
        "Contributed to a Firebase-backed platform spanning designer tools, admin workflows, client review, public shopping, checkout, and order management.",
        "Improved GussyApp project workflows across collage-builder comments, uploaded files/photos, project questionnaire behavior, access controls, local storage compression, and client-facing review states.",
        "Fixed commerce and admin workflows across order previews, delivery fees, paid/cancelled/delivered status actions, voucher storage, merchant/admin exports, Gussy Finds, Get That Look, and checkout edge cases.",
        "Maintained React/Firebase shop surfaces, including responsive Get That Look layouts, related-product behavior, empty-cart checkout handling, product display fixes, and shop page cleanup.",
      ],
      links: [],
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
      items: ["React", "Next.js", "Node.js", "Zod"],
    },
    {
      label: "Cloud & data",
      items: ["Firebase", "Firestore", "Firebase Storage", "Vercel"],
    },
    {
      label: "Product tooling",
      items: ["Konva", "Contentful", "SendGrid"],
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
