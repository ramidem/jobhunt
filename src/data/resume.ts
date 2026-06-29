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
    "Software engineer focused on reliable web systems, product workflows, and practical tooling.",
  education: [],
  experience: [],
  projects: [
    {
      organization: "Coaxis CMS",
      location: "Strapi / TypeScript / GCP",
      role: "Project Lead / Software Engineer",
      start: "Jan 2025",
      end: "May 2025",
      summary:
        "Strapi CMS for content, marketplace, opportunity review, and verification workflows.",
      bullets: [
        "Led CMS development for Coaxis content, marketplace pages, opportunity settings, and admin workflows.",
        "Built custom Strapi plugins for opportunity review, collaborators, preview links, and AI/II verification.",
        "Integrated Coaxis APIs with TypeScript services, React admin hooks, JWT review tokens, and status endpoints.",
      ],
      links: [],
    },
    {
      organization: "Gussy",
      location: "Firebase / React / Konva",
      role: "Contributing Software Engineer",
      start: "Nov 2020",
      end: "Mar 2021",
      summary:
        "Interior design and commerce platform for designer workflows, client review, shopping, and checkout.",
      bullets: [
        "Improved collage comments, uploads, questionnaires, access controls, and client review states.",
        "Fixed order previews, delivery fees, payment statuses, vouchers, and admin exports.",
        "Maintained React/Firebase shop pages, checkout flows, related products, and product displays.",
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
      items: ["React", "Next.js", "Node.js", "Strapi", "Zod"],
    },
    {
      label: "Cloud & data",
      items: ["Google Cloud", "Firebase", "Firestore", "Firebase Storage", "Vercel"],
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
