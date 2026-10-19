// Short first-person answers to read aloud, built from Med's resume and project records.
// Client work uses public names (NDA). [Brackets] mark where to drop in a specific detail.
// Keyed by the exact prompt of a seed card.
export const scripts: Record<string, string> = {
  "Tell me about yourself.":
    "I'm a backend-leaning full-stack engineer based in Davao, working remotely with Symph since 2020. Most of my work is TypeScript, React, Next.js and Node on Google Cloud and Firebase. For almost five years I maintained a financial services platform used by branch staff for verification and money transfers. More recently I led an HR and payroll platform and an internal operations platform, using AI-assisted workflows to ship faster. I'm looking for a role where I can own product systems end to end, and that's why this position caught my eye.",

  "Tell me about a time you disagreed with a teammate or client.":
    "On [project], the client wanted [feature] built a certain way, and I thought it would cause problems with [data, permissions or maintenance]. I didn't just push back. I asked what they were really trying to achieve, then showed two options with the trade-offs in plain language. We agreed on [the option], and it shipped without [the problem]. What I took from it: disagree with data and options, then commit fully once we decide.",

  "Describe a production incident you handled.":
    "On the financial services platform, [describe the issue, e.g. a receipt upload or report failing for branches]. First I confirmed the impact and kept the team updated. Then I traced it through the logs and transaction records to [the cause], shipped a fix, and checked the affected transactions. Afterwards I added [logging, a test or a validation] so it wouldn't happen again. With money involved, I learned to communicate early and fix the root cause, not just the symptom.",

  "Tell me about a skill you had to learn quickly for a project.":
    "When I led the content management platform, I hadn't worked with Strapi plugins before. I read the docs, built a small spike first, and then built custom plugins for content review and verification. I also set up CI/CD with Cloud Build on Google Cloud. My approach is: learn the basics fast, build something small to de-risk it, then ship. I'd bring the same approach to [AWS, Docker or the stack in this role].",

  "Why do you want to work here?":
    "I like that you're [what the company does], and the role matches what I do best: building full-stack systems with TypeScript, React and Node, and the backend behind them. I've built things like role-based access control, payroll workflows and operations dashboards, so I can contribute early. I also want to grow in [AWS, cloud or AI], and this team looks like the right place for that.",

  "How do you explain a technical trade-off to a non-technical stakeholder?":
    "I start with what they care about: time, cost or risk. On the internal operations platform I often explained technical choices to sales and client teams. I'd say something like: option A is faster to ship but harder to change later; option B takes a week longer but supports the reports you want next quarter. I recommend one, then check they're comfortable before we move on.",

  "How do you handle multiple deadlines at once?":
    "I make everything visible first, then prioritize with the team or client by impact and urgency. When I led the HR and payroll platform, we ran daily standups, so priorities were clear every morning. I break work into small pieces I can ship, and if something is going to slip, I say so early with a new date, not on the deadline.",

  "How do you take direction and criticism?":
    "I treat it as information, not as personal. On the veterinary clinic platform, I took direction on priorities and responded to review feedback on the access-control work. I ask clarifying questions, fix it, and follow up to confirm it's what they meant. In code reviews I'm on both sides. I've mentored and reviewed teammates' code, so I know how useful clear feedback is.",

  "How would you design role-based access control for a multi-tenant admin app?":
    "I've built this on the veterinary clinic platform and the HR and payroll platform. I define roles and permissions as actions on resources, using CASL, and check them on the server for every request, not just in the UI. Every query is scoped to the tenant or clinic. The frontend uses the same rules to hide what you can't do. I keep it testable with a permission matrix and log sensitive actions.",

  "Design a URL shortener. What do you cover?":
    "First I'd clarify scale and features like custom links and expiry. Then I'd go through the API, how to generate short IDs, a key-value store for lookups, and caching, because reads far outnumber writes. I'd also cover redirects, rate limiting, analytics and failure cases. I keep it simple first, then scale the parts that need it.",

  "How do you handle errors in an Express or NestJS API?":
    "I validate input at the edge with Zod or DTOs, throw typed errors, and handle them in one place, an exception filter in NestJS or error middleware in Express. That maps them to the right status code and a safe message. I log details with a request ID and never leak stack traces. On the financial platform, clear errors and logs made support much easier.",

  "Walk through deploying a Node API to Google Cloud with CI/CD.":
    "I've set up CI/CD with Cloud Build for the content management platform. A push triggers Cloud Build, which builds the image, pushes it to Artifact Registry, and deploys to Cloud Run or App Engine. Secrets come from Secret Manager, and the service runs with a least-privilege service account. I watch logs in Cloud Logging, and rolling back is just moving traffic to the previous revision.",

  "How would you model one-to-many data in Firestore?":
    "On the HR and payroll platform we used org-scoped Firestore data. I design around the queries: subcollections for big or separately queried lists, embedded fields for small ones, and some duplication where it saves reads. Security rules enforce who can read what, since the browser talks to Firestore directly.",

  "How would you find and fix a slow React page?":
    "I profile first with React DevTools, so I'm not guessing. Usually it's unnecessary re-renders, a big list, or heavy work during render. Fixes are splitting state, memoizing, virtualizing lists, deferring work, or moving data fetching to the server. Then I measure again to confirm it actually got faster.",

  "When would you use a stored procedure, and what are the risks?":
    "On the financial services platform, stored procedures handled transaction logic close to the data, which is good for consistency. The risks are that logic is hidden from normal code review and harder to test and version. So I keep them in migrations, document the contract, and test them like any other code.",

  "How do you evolve a production schema safely with an ORM like Drizzle?":
    "On the veterinary clinic platform I made PostgreSQL schema changes with Drizzle for role and clinic memberships. I change the schema in code, generate the migration, review the SQL, and keep changes backward compatible, adding first and tightening later, so old and new code both work during the deploy.",

  "How would you add an LLM feature to an existing app responsibly?":
    "I use AI-assisted workflows daily, and I've worked on an AI-assisted lesson planning tool. I'd start with one narrow use case, call the model from the server, ground it in our own data where facts matter, and validate the output against a schema. Then I'd log results to evaluate quality and add cost limits. For anything risky, a human stays in the loop.",

  "When would you NOT split into microservices?":
    "I've worked on a financial services microservices platform, so I've seen the cost: more deployments, network failures and harder debugging. If the team is small or the boundaries aren't clear yet, I'd start with a well-structured modular monolith, and split out a service only when a real scaling or team need shows up.",

  "What belongs in a good CI pipeline for a TypeScript app?":
    "Install with a lockfile, then lint, typecheck, run tests and build, failing fast. After that come integration tests and a dependency scan, then building the image and deploying to staging. I've used Cloud Build for this. Secrets stay in the CI secret store, and caching keeps it fast.",
};
