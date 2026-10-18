import type { Application, Skill } from "@/lib/tracker";

// LinkedIn search, 2026-10-19: remote, Philippines, "full stack engineer typescript", past week.
// matchPercent = share of the posting's tech keywords that already appear in the resume/tech stack.
// It is a rough keyword count, not a fit score.
const searchedOn = "2026-10-19T00:00:00.000Z";

type Lead = Pick<Application, "company" | "role" | "matchPercent" | "notes"> & { jobId: string };

const leads: Lead[] = [
  {
    jobId: "4479575723",
    company: "Somewhere (client: digital marketing agency)",
    role: "Senior Web Developer",
    matchPercent: 71,
    notes: "$2,600–5,800/mo · 5+ yrs · Missing: MongoDB, GraphQL, AWS, Docker, Cypress",
  },
  {
    jobId: "4479027973",
    company: "Cruise Control Group",
    role: "Senior Full Stack Software Engineer",
    matchPercent: 62,
    notes: "Day shift · 5+ yrs · Missing: GraphQL, AWS, Docker, Cypress, Playwright",
  },
  {
    jobId: "4480336831",
    company: "Remote Office",
    role: "Full Stack Engineer (React + Node)",
    matchPercent: 54,
    notes: "10AM–6PM AEST, AI-assisted dev · Missing: Redis, Cypress, Playwright, LLM/OpenAI, Supabase",
  },
  {
    jobId: "4040668457",
    company: "3Cloud",
    role: "Senior Consultant - Software Engineering",
    matchPercent: 47,
    notes: "Consulting, 5–7 yrs · Missing: AWS, Azure, Kubernetes, Terraform, C#/.NET, Angular, Serverless",
  },
  {
    jobId: "4477283361",
    company: "DT Technologies",
    role: "Senior Full Stack Developer",
    matchPercent: 44,
    notes: "JS-heavy, 5 yrs · Missing: MongoDB, Redis, AWS, Kafka, RabbitMQ",
  },
  {
    jobId: "4480818781",
    company: "Hunt St",
    role: "Sr AI-Augmented Full-Stack Developer / Solutions Engineer",
    matchPercent: 43,
    notes: "AUD 2,500–3,500/mo contractor · Missing: Azure, Docker, Python, C#/.NET, LLM/OpenAI, RAG",
  },
  {
    jobId: "4479272706",
    company: "Teamified",
    role: "Senior Fullstack Engineer (Filipino citizens)",
    matchPercent: 42,
    notes: "4+ yrs · Missing: AWS, Kubernetes, PHP/Laravel, Vue, Kafka, LLM",
  },
  {
    jobId: "4479160772",
    company: "Hyre",
    role: "AI Engineer",
    matchPercent: 40,
    notes: "Agentic AI, 5+ yrs · Missing: Python, AWS, Azure, LLM, LangChain, RAG",
  },
  {
    jobId: "4477546068",
    company: "Arca.ph (client: US SaaS)",
    role: "Senior Full-Stack Software Engineer",
    matchPercent: 36,
    notes: "7+ yrs · Missing: AWS, Docker, Kubernetes, Terraform, Redis, GraphQL, Kafka, Python, LLM/RAG",
  },
  {
    jobId: "4478106692",
    company: "Perform",
    role: "Python / AI Solutions Full-Stack Developer",
    matchPercent: 32,
    notes: "Python-first · Missing: Python, Django/FastAPI, Vue, GraphQL, AWS, Azure, Docker, LLM, LangChain, RAG",
  },
];

export const jobLeads: Application[] = leads.map(({ jobId, ...lead }) => ({
  ...lead,
  id: `linkedin-${jobId}`,
  status: "Saved",
  url: `https://www.linkedin.com/jobs/view/${jobId}/`,
  appliedOn: "",
  jobDescription: "",
  createdAt: searchedOn,
}));

// Skills from project records that the resume skills list leaves out, plus gaps seen in the leads above.
// demand = how many of the 10 leads mention it.
export const skillSeeds: Skill[] = [
  ...["Express", "Tailwind CSS", "Jest", "React Native", "Expo", "CI/CD (Cloud Build)", "Microservices"].map(
    (name) => ({ id: `seed-know-${name}`, name, status: "know" as const }),
  ),
  ...(
    [
      ["AWS", 8],
      ["LLM integration", 6],
      ["Docker", 5],
      ["Azure", 4],
      ["Python", 4],
      ["RAG", 4],
      ["GraphQL", 4],
      ["Redis", 3],
      ["Kubernetes", 3],
      ["Kafka", 3],
      ["Cypress", 3],
      ["OpenAI API", 3],
      ["C# / .NET", 3],
      ["Terraform", 2],
      ["Playwright", 2],
      ["MongoDB", 2],
      ["LangChain", 2],
    ] as const
  ).map(([name, demand]) => ({ id: `seed-want-${name}`, name, status: "want" as const, demand })),
];
