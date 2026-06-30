import { resumeSchema, type Resume } from "@/lib/resume-schema";

const draftResume = {
  name: "Med Aduh",
  headline: "Software Engineer | Backend-leaning full-stack systems and product delivery",
  location: "Davao City, Philippines / Remote",
  email: "im.ramidem@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/ramidem" },
    { label: "Resume", href: "https://github.com/ramidem/resume" },
  ],
  summary:
    "Full-stack engineer using AI-assisted workflows to ship reliable product systems, backend services, and operational tooling.",
  education: [],
  experience: [
    {
      organization: "Symph",
      location: "Remote",
      role: "Software Engineer",
      start: "Nov 2020",
      end: "Present",
      summary:
        "Client and product engineering across NDA platforms, using full-stack and AI-assisted workflows to ship operational software.",
      bullets: [
        "Shipped production work across React, TypeScript, Next.js, NestJS, Firebase, Strapi, MySQL/PostgreSQL, and Google Cloud.",
      ],
      highlights: [
        {
          organization: "Financial Services Operations Platform",
          location: "React / TypeScript / MySQL",
          role: "Software Engineer",
          start: "Jan 2021",
          end: "Nov 2025",
          bullets: [
            "Maintained KYC, remittance, ShopSafe, vault, reporting, receipt, and checkout workflows across React, Node/NestJS, MySQL, and stored procedures.",
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
          bullets: [
            "Led Strapi 5 CMS work for content, marketplace pages, opportunity settings, custom admin plugins, and verification workflows.",
            "Integrated platform APIs through TypeScript services, React admin hooks, JWT review tokens, and status endpoints.",
          ],
          links: [],
        },
        {
          organization: "Veterinary Clinic Platform",
          location: "NestJS / Next.js / CASL",
          role: "Software Engineer",
          start: "Jan 2026",
          end: "Jan 2026",
          bullets: [
            "Implemented CASL-based RBAC across NestJS and Next.js for platform admins, clinic owners, vets, staff, and pet owners.",
            "Migrated role/clinic-membership checks with PostgreSQL/Drizzle schema changes, service-layer guards, and API client updates.",
          ],
          links: [],
        },
        {
          organization: "Interior Design Commerce Platform",
          location: "Firebase / React / Konva",
          role: "Contributing Software Engineer",
          start: "Nov 2020",
          end: "Mar 2021",
          bullets: [
            "Improved React/Firebase design, client review, upload, questionnaire, access-control, shop, checkout, voucher, and admin export workflows.",
          ],
          links: [],
        },
      ],
      links: [],
    },
  ],
  projects: [],
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
