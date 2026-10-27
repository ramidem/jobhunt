import { resumeSchema, type Resume } from "@/lib/resume-schema";

const draftResume = {
  name: "Medimar Aduh",
  headline: "Fullstack Software Engineer",
  location: "Davao City, Philippines (Remote)",
  // Phone and email are private. They are not part of this module, so the static export
  // cannot compile them into a public file. The signed-in user reads their own row from
  // public.resume_contact. Do not add them back here.
  // Labels are the visible URLs so text-only ATS parsers capture them.
  links: [
    { label: "linkedin.com/in/med-aduh", href: "https://www.linkedin.com/in/med-aduh" },
    { label: "github.com/ramidem", href: "https://github.com/ramidem" },
  ],
  summary: "Built and maintained client web products across finance, retail, HR and healthcare, so teams and customers could get their daily work done in one place.",
  education: [
    {
      institution: "Western Mindanao State University",
      degree: "BS, Mass Communication/Media Studies",
      dates: "Graduated",
      details: [],
    },
  ],
  experience: [
    {
      organization: "Symph",
      location: "Remote",
      role: "Fullstack Software Engineer",
      start: "Nov 2020",
      end: "Present",
      bullets: [
        "Built and maintained client web products across finance, retail, HR and healthcare, so teams and customers could get their daily work done in one place.",
      ],
      highlights: [
        {
          organization: "Financial Services Platform",
          role: "Project",
          start: "Jan 2021",
          end: "Nov 2025",
          bullets: [
          "Maintained a financial services platform for nearly five years (React, TypeScript, JavaScript, HTML, CSS, Node.js, SQL, Google Cloud), so branch staff could verify customers, transfer money and run reports smoothly.",
          "Built microservices with RESTful APIs for transactions, customer checks and PDF/CSV reports, so staff could review balances and fund transfers.",
          "Built the online shop checkout with MCash and PayMongo payments, so customers could pay and pick up orders.",
          "Maintained the database logic behind transfers and reports (stored procedures, SQL) while mentoring teammates, reviewing code in Git and acting on feedback, so reports rolled up by branch and region.",
          ],
          links: [],
        },
        {
          organization: "Content Management Platform",
          role: "Project",
          start: "Jan 2025",
          end: "May 2025",
          bullets: [
          "Led a content platform from scratch (React), collaborating with the client's team and guiding developers, so staff could manage marketplace content from one screen.",
          "Set up the Google Cloud DevOps pipeline (Docker, CI/CD), so every change was checked before going live.",
          ],
          links: [],
        },
        {
          organization: "HR and Payroll Platform",
          role: "Project",
          start: "Feb 2026",
          end: "Jun 2026",
          bullets: [
          "Led a full-stack HR and payroll system from scratch (TypeScript) using AI coding tools, with daily Agile standups, so companies could manage staff, leave and payroll in one place.",
          "Added role-based access (RBAC), so each person sees only the data they need across staff, leave and payroll.",
          ],
          links: [],
        },
        {
          organization: "Distributor Operations Platform",
          role: "Project",
          start: "May 2026",
          end: "Jun 2026",
          bullets: [
          "Led a full-stack operations tool from scratch, setting priorities with the team and explaining choices to non-technical staff, so sales teams could track accounts, visits and reports in one place and export them when needed.",
          ],
          links: [],
        },
      ],
      links: [],
    },
  ],
  projects: [],
  leadership: [],
  skills: [],
  interests: ["Product systems", "developer experience", "automation"],
  updatedAt: new Date("2026-06-30T00:00:00.000Z").toISOString(),
} satisfies Resume;

export const resume = resumeSchema.parse(draftResume);
