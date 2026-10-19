import { resumeSchema, type Resume } from "@/lib/resume-schema";

const draftResume = {
  name: "Med Aduh",
  headline: "Software Engineer | Backend-leaning full-stack systems and product delivery",
  location: "Davao City, Philippines (Remote)",
  phone: "+63 955 908 7053",
  email: "im.ramidem@gmail.com",
  // Labels are the visible URLs so text-only ATS parsers capture them.
  links: [
    { label: "linkedin.com/in/med-aduh", href: "https://www.linkedin.com/in/med-aduh" },
    { label: "github.com/ramidem", href: "https://github.com/ramidem" },
  ],
  summary:
    "Full-stack engineer using AI-assisted workflows to ship reliable product systems, backend services, and operational tooling.",
  education: [
    {
      institution: "Western Mindanao State University",
      // Med did not graduate: never write "Graduated", a degree award or a status line.
      // Add attended years as `dates` once Med confirms them.
      degree: "Coursework in Mass Communication/Media Studies",
      details: [],
    },
  ],
  experience: [
    {
      organization: "Symph",
      location: "Remote",
      role: "Software Engineer",
      start: "Nov 2020",
      end: "Present",
      // Order: Alignly, FCCD, MLhuillier, Coaxis, MyPetCare, Lesson Planner (set by Med).
      // Written against the Full Stack, AI Engineer, and Cloud qualifications in data/qualifications.json,
      // with soft skills (leading, collaboration, feedback). Personal projects (RoundSave, Nookbud) are excluded.
      bullets: [
        "Led AI-augmented development of an HR and payroll platform using TypeScript, React, Next.js, and Firebase on Google Cloud, running daily Agile standups and partnering with client stakeholders to turn their requests into features, so companies could manage employees, time off, and payroll in one system.",
        "Led AI-augmented development of an internal operations platform using JavaScript, TypeScript, HTML, CSS, React, and Playwright tests, setting priorities with the team and explaining technical choices to non-technical client teams, so sales staff could track accounts, visits, and distributor reports in one place.",
        "Maintained a financial services platform for nearly five years using React, Node.js, NestJS, REST APIs, SQL, and Jest, mentoring teammates, reviewing their code, and acting on feedback, so branch staff could complete customer verification, money transfers, and daily reports more smoothly.",
        "Led a content management platform project using Strapi, TypeScript, React, Google Cloud, and CI/CD with Cloud Build, guiding fellow developers and coordinating with the client's team, so their staff could review and manage marketplace content from one admin screen.",
        "Implemented role-based access control with NestJS, Next.js, TypeScript, and PostgreSQL for a veterinary clinic platform, taking direction on priorities and responding to review feedback, so clinic owners, vets, staff, and pet owners each see only the information meant for them.",
        "Improved the lesson document export and web pages of an AI-assisted lesson planning platform using Next.js, React, and TypeScript, as part of a team, so teachers could download their lesson plans as Word documents.",
      ],
      highlights: [],
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
      items: ["React", "React Native", "Next.js", "Node.js", "NestJS", "Tailwind CSS", "Strapi", "Zod"],
    },
    {
      label: "Cloud & data",
      items: [
        "Google Cloud (GCP)",
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
      items: ["Git", "Microservices", "Full-stack architecture", "developer tooling", "testing", "automation"],
    },
  ],
  interests: ["Product systems", "developer experience", "automation"],
  updatedAt: new Date("2026-06-30T00:00:00.000Z").toISOString(),
} satisfies Resume;

export const resume = resumeSchema.parse(draftResume);
