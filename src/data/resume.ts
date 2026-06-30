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
      organization: "Veterinary Clinic Platform",
      location: "NestJS / Next.js / CASL",
      role: "Software Engineer",
      start: "Jan 2026",
      end: "Jan 2026",
      summary:
        "Veterinary clinic management platform for clinic operations, medical records, billing, and role-based access.",
      bullets: [
        "Implemented CASL-based RBAC across a NestJS backend and Next.js admin UI.",
        "Migrated role and clinic-membership authorization with PostgreSQL/Drizzle schema changes and service-layer checks.",
        "Built service management foundations and fixed encounter, inventory, SMS history, payroll, and frontend permission issues.",
      ],
      links: [],
    },
    {
      organization: "Financial Services Operations Platform",
      location: "React / TypeScript / MySQL",
      role: "Software Engineer",
      start: "Jan 2021",
      end: "Nov 2025",
      summary:
        "Branch operations and commerce platform for KYC, money transfer, ShopSafe, vault, reporting, and checkout workflows.",
      bullets: [
        "Maintained branch-facing financial workflows across KYC, money transfer, ShopSafe, vault, reports, receipts, and checkout.",
        "Built React, TypeScript, Node/NestJS, and MySQL changes across dependent services and stored procedures.",
        "Delivered bank/vault reports, fund-request receipts, OTP controls, branch pickup, and MCash/PayMongo checkout fixes.",
      ],
      links: [],
    },
    {
      organization: "CMS / Marketplace Admin Platform",
      location: "Strapi / TypeScript / GCP",
      role: "Project Lead / Software Engineer",
      start: "Jan 2025",
      end: "May 2025",
      summary:
        "Strapi CMS for content, marketplace, review, verification, and admin workflows.",
      bullets: [
        "Led CMS development for content, marketplace pages, opportunity settings, and admin workflows.",
        "Built custom Strapi plugins for opportunity review, collaborators, preview links, and AI/II verification.",
        "Integrated platform APIs with TypeScript services, React admin hooks, JWT review tokens, and status endpoints.",
      ],
      links: [],
    },
    {
      organization: "Interior Design Commerce Platform",
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
      items: ["React", "Next.js", "Node.js", "NestJS", "Strapi", "Zod"],
    },
    {
      label: "Cloud & data",
      items: [
        "Google Cloud",
        "Firebase",
        "MySQL",
        "PostgreSQL",
        "Drizzle ORM",
        "Firestore",
        "Firebase Storage",
        "Vercel",
      ],
    },
    {
      label: "Product tooling",
      items: ["CASL", "Konva", "Contentful", "SendGrid"],
    },
    {
      label: "Practices",
      items: ["Full-stack architecture", "developer tooling", "testing", "automation"],
    },
  ],
  interests: ["Product systems", "developer experience", "automation"],
  updatedAt: new Date("2026-06-30T00:00:00.000Z").toISOString(),
} satisfies Resume;

export const resume = resumeSchema.parse(draftResume);
