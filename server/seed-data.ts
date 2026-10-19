// Initial rows for a fresh tracker database. Only used when the database is empty.

// Snapshot of the resume skills list plus skills shown in the project records.
export const knownSkills = [
  "TypeScript",
  "JavaScript",
  "SQL",
  "React",
  "Next.js",
  "Node.js",
  "NestJS",
  "Strapi",
  "Zod",
  "Google Cloud",
  "Firebase",
  "MySQL",
  "PostgreSQL",
  "Drizzle ORM",
  "Vercel",
  "CASL",
  "Konva",
  "Contentful",
  "SendGrid",
  "Express",
  "Tailwind CSS",
  "Jest",
  "React Native",
  "Expo",
  "CI/CD",
  "Microservices",
];

type Lead = {
  externalId: string;
  company: string;
  title: string;
  details: string;
  skills: string[];
};

// LinkedIn search, 2026-10-19: remote, Philippines, "full stack engineer typescript", past week.
// skills = tech keywords found in each posting.
export const leads: Lead[] = [
  {
    externalId: "4479575723",
    company: "Somewhere (client: digital marketing agency)",
    title: "Senior Web Developer",
    details: "$2,600–5,800/mo · 5+ yrs",
    skills: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Express", "PostgreSQL", "MongoDB", "GraphQL", "Google Cloud", "AWS", "Docker", "CI/CD", "Tailwind CSS", "Jest", "Cypress", "Vercel"],
  },
  {
    externalId: "4479027973",
    company: "Cruise Control Group",
    title: "Senior Full Stack Software Engineer",
    details: "Day shift · 5+ yrs",
    skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "GraphQL", "Google Cloud", "AWS", "Docker", "CI/CD", "Tailwind CSS", "Cypress", "Playwright"],
  },
  {
    externalId: "4480336831",
    company: "Remote Office",
    title: "Full Stack Engineer (React + Node)",
    details: "10AM–6PM AEST · AI-assisted dev",
    skills: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Express", "Redis", "Cypress", "Playwright", "LLM integration", "OpenAI API", "Supabase", "Vercel"],
  },
  {
    externalId: "4040668457",
    company: "3Cloud",
    title: "Senior Consultant - Software Engineering",
    details: "Consulting · 5–7 yrs",
    skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "Google Cloud", "AWS", "Azure", "Kubernetes", "Terraform", "CI/CD", "C#", ".NET", "Angular", "Microservices", "Serverless"],
  },
  {
    externalId: "4477283361",
    company: "DT Technologies",
    title: "Senior Full Stack Developer",
    details: "JS-heavy · 5 yrs",
    skills: ["JavaScript", "Next.js", "PostgreSQL", "MongoDB", "Redis", "AWS", "Kafka", "RabbitMQ", "Vercel"],
  },
  {
    externalId: "4480818781",
    company: "Hunt St",
    title: "Sr AI-Augmented Full-Stack Developer / Solutions Engineer",
    details: "AUD 2,500–3,500/mo · contractor",
    skills: ["TypeScript", "JavaScript", "React", "Next.js", "PostgreSQL", "Azure", "Docker", "CI/CD", "Python", "C#", ".NET", "LLM integration", "OpenAI API", "RAG"],
  },
  {
    externalId: "4479272706",
    company: "Teamified",
    title: "Senior Fullstack Engineer (Filipino citizens)",
    details: "4+ yrs",
    skills: ["React", "Next.js", "PostgreSQL", "MySQL", "AWS", "Kubernetes", "CI/CD", "PHP", "Laravel", "Vue", "Kafka", "LLM integration"],
  },
  {
    externalId: "4479160772",
    company: "Hyre",
    title: "AI Engineer",
    details: "Agentic AI · 5+ yrs",
    skills: ["TypeScript", "React", "Google Cloud", "AWS", "Azure", "CI/CD", "Python", "LLM integration", "LangChain", "RAG"],
  },
  {
    externalId: "4477546068",
    company: "Arca.ph (client: US SaaS)",
    title: "Senior Full-Stack Software Engineer",
    details: "7+ yrs",
    skills: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "PostgreSQL", "Redis", "GraphQL", "Google Cloud", "AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Python", "C#", ".NET", "Kafka", "LLM integration", "RAG", "Elasticsearch"],
  },
  {
    externalId: "4478106692",
    company: "Perform",
    title: "Python / AI Solutions Full-Stack Developer",
    details: "Python-first",
    skills: ["TypeScript", "JavaScript", "React", "Next.js", "GraphQL", "Google Cloud", "AWS", "Azure", "Docker", "CI/CD", "Python", "Django", "FastAPI", "Vue", "LLM integration", "OpenAI API", "LangChain", "RAG", "Serverless"],
  },
];
