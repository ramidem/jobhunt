import { resumeSchema, type Resume } from "@/lib/resume-schema";

const draftResume = {
  name: "Med Aduh",
  headline: "AI-assisted software engineer | Product systems and backend workflows",
  location: "Manila, Philippines / Remote",
  email: "im.ramidem@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/ramidem" },
    { label: "Resume", href: "https://github.com/ramidem/resume" },
  ],
  summary:
    "Full-stack engineer using AI-assisted workflows to ship reliable product systems, backend services, and operational tooling.",
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
        "Implemented CASL-based RBAC across NestJS and Next.js for platform admins, clinic owners, vets, staff, and pet owners.",
        "Migrated role and clinic-membership checks with PostgreSQL/Drizzle schema changes, service-layer guards, and API client updates.",
        "Stabilized encounter autosave, inventory pagination, SMS history, payroll visibility, and permission-gated navigation.",
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
        "Maintained branch-facing workflows for KYC, remittance, ShopSafe, vault, reports, receipts, and checkout.",
        "Built React, TypeScript, Node/NestJS, and MySQL changes across dependent services, APIs, and stored procedures.",
        "Delivered bank/vault reports, fund-request receipts, OTP controls, branch pickup, and payment workflow fixes.",
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
        "Led Strapi 5 CMS development for content, marketplace pages, opportunity settings, and admin workflows.",
        "Built custom admin plugins for opportunity review, collaborators, preview links, and AI/II verification.",
        "Integrated platform APIs through TypeScript services, React admin hooks, JWT review tokens, and status endpoints.",
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
        "Improved collage comments, uploads, questionnaires, access controls, and client review workflows.",
        "Fixed order previews, delivery fees, payment status actions, voucher storage, and admin exports.",
        "Maintained React/Firebase shop pages, checkout handling, related products, and product display behavior.",
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
