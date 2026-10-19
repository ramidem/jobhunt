// Study links per skill: a roadmap.sh roadmap where one fits, and the official docs.
// Keys match skill names in the skills table (case-insensitive).
export type StudyLinks = { roadmap?: string; docs: { label: string; url: string }[] };

const links: Record<string, StudyLinks> = {
  typescript: { roadmap: "https://roadmap.sh/typescript", docs: [{ label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" }] },
  javascript: { roadmap: "https://roadmap.sh/javascript", docs: [{ label: "MDN JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" }] },
  sql: { roadmap: "https://roadmap.sh/sql", docs: [{ label: "PostgreSQL SQL reference", url: "https://www.postgresql.org/docs/current/sql.html" }] },
  react: { roadmap: "https://roadmap.sh/react", docs: [{ label: "react.dev", url: "https://react.dev/learn" }] },
  "next.js": { roadmap: "https://roadmap.sh/frontend", docs: [{ label: "Next.js docs", url: "https://nextjs.org/docs" }] },
  "node.js": { roadmap: "https://roadmap.sh/nodejs", docs: [{ label: "Node.js API", url: "https://nodejs.org/docs/latest/api/" }] },
  nestjs: { roadmap: "https://roadmap.sh/backend", docs: [{ label: "NestJS docs", url: "https://docs.nestjs.com/" }] },
  express: { roadmap: "https://roadmap.sh/nodejs", docs: [{ label: "Express guide", url: "https://expressjs.com/en/guide/routing.html" }] },
  postgresql: { roadmap: "https://roadmap.sh/postgresql-dba", docs: [{ label: "PostgreSQL docs", url: "https://www.postgresql.org/docs/current/" }] },
  mysql: { roadmap: "https://roadmap.sh/sql", docs: [{ label: "MySQL reference", url: "https://dev.mysql.com/doc/refman/8.4/en/" }] },
  "google cloud": {
    roadmap: "https://roadmap.sh/devops",
    docs: [
      { label: "Google Cloud docs", url: "https://cloud.google.com/docs" },
      { label: "Architecture Center", url: "https://cloud.google.com/architecture" },
      { label: "Cloud Run", url: "https://cloud.google.com/run/docs" },
      { label: "IAM", url: "https://cloud.google.com/iam/docs/overview" },
    ],
  },
  firebase: { docs: [{ label: "Firebase docs", url: "https://firebase.google.com/docs" }] },
  firestore: { docs: [{ label: "Firestore docs", url: "https://firebase.google.com/docs/firestore" }] },
  "firebase storage": { docs: [{ label: "Cloud Storage for Firebase", url: "https://firebase.google.com/docs/storage" }] },
  vercel: { docs: [{ label: "Vercel docs", url: "https://vercel.com/docs" }] },
  "drizzle orm": { docs: [{ label: "Drizzle docs", url: "https://orm.drizzle.team/docs/overview" }] },
  zod: { docs: [{ label: "Zod docs", url: "https://zod.dev/" }] },
  strapi: { docs: [{ label: "Strapi docs", url: "https://docs.strapi.io/" }] },
  casl: { docs: [{ label: "CASL guide", url: "https://casl.js.org/v6/en/guide/intro" }] },
  konva: { docs: [{ label: "Konva docs", url: "https://konvajs.org/docs/" }] },
  contentful: { docs: [{ label: "Contentful docs", url: "https://www.contentful.com/developers/docs/" }] },
  sendgrid: { docs: [{ label: "SendGrid docs", url: "https://www.twilio.com/docs/sendgrid" }] },
  "tailwind css": { roadmap: "https://roadmap.sh/frontend", docs: [{ label: "Tailwind docs", url: "https://tailwindcss.com/docs" }] },
  jest: { roadmap: "https://roadmap.sh/javascript", docs: [{ label: "Jest docs", url: "https://jestjs.io/docs/getting-started" }] },
  "react native": { roadmap: "https://roadmap.sh/react-native", docs: [{ label: "React Native docs", url: "https://reactnative.dev/docs/getting-started" }] },
  expo: { roadmap: "https://roadmap.sh/react-native", docs: [{ label: "Expo docs", url: "https://docs.expo.dev/" }] },
  "ci/cd": {
    roadmap: "https://roadmap.sh/devops",
    docs: [
      { label: "GitHub Actions", url: "https://docs.github.com/en/actions" },
      { label: "Cloud Build", url: "https://cloud.google.com/build/docs" },
    ],
  },
  microservices: { roadmap: "https://roadmap.sh/system-design", docs: [{ label: "microservices.io patterns", url: "https://microservices.io/patterns/" }] },
  aws: {
    roadmap: "https://roadmap.sh/aws",
    docs: [
      { label: "AWS docs", url: "https://docs.aws.amazon.com/" },
      { label: "Well-Architected", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html" },
    ],
  },
  azure: {
    roadmap: "https://roadmap.sh/devops",
    docs: [
      { label: "Azure docs", url: "https://learn.microsoft.com/en-us/azure/" },
      { label: "Azure Architecture Center", url: "https://learn.microsoft.com/en-us/azure/architecture/" },
    ],
  },
  docker: { roadmap: "https://roadmap.sh/docker", docs: [{ label: "Docker docs", url: "https://docs.docker.com/" }] },
  kubernetes: { roadmap: "https://roadmap.sh/kubernetes", docs: [{ label: "Kubernetes docs", url: "https://kubernetes.io/docs/home/" }] },
  terraform: { roadmap: "https://roadmap.sh/terraform", docs: [{ label: "Terraform docs", url: "https://developer.hashicorp.com/terraform/docs" }] },
  python: { roadmap: "https://roadmap.sh/python", docs: [{ label: "Python docs", url: "https://docs.python.org/3/" }] },
  "django / fastapi": { roadmap: "https://roadmap.sh/python", docs: [{ label: "FastAPI docs", url: "https://fastapi.tiangolo.com/" }, { label: "Django docs", url: "https://docs.djangoproject.com/" }] },
  graphql: { roadmap: "https://roadmap.sh/graphql", docs: [{ label: "GraphQL learn", url: "https://graphql.org/learn/" }] },
  redis: { roadmap: "https://roadmap.sh/redis", docs: [{ label: "Redis docs", url: "https://redis.io/docs/latest/" }] },
  mongodb: { roadmap: "https://roadmap.sh/mongodb", docs: [{ label: "MongoDB docs", url: "https://www.mongodb.com/docs/" }] },
  "llm integration": { roadmap: "https://roadmap.sh/ai-engineer", docs: [{ label: "OpenAI docs", url: "https://platform.openai.com/docs" }] },
  "openai api": { roadmap: "https://roadmap.sh/ai-engineer", docs: [{ label: "OpenAI docs", url: "https://platform.openai.com/docs" }] },
  rag: { roadmap: "https://roadmap.sh/ai-engineer", docs: [] },
  langchain: { roadmap: "https://roadmap.sh/ai-engineer", docs: [{ label: "LangChain docs", url: "https://python.langchain.com/docs/introduction/" }] },
  kafka: { roadmap: "https://roadmap.sh/backend", docs: [{ label: "Kafka docs", url: "https://kafka.apache.org/documentation/" }] },
  cypress: { docs: [{ label: "Cypress docs", url: "https://docs.cypress.io/" }] },
  playwright: { docs: [{ label: "Playwright docs", url: "https://playwright.dev/docs/intro" }] },
  "system design": { roadmap: "https://roadmap.sh/system-design", docs: [] },
};

export function studyLinks(name: string): StudyLinks | null {
  return links[name.toLowerCase()] ?? null;
}
