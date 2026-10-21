// Interview-stage cards and learning paths, aligned with a typical full-stack hiring flow:
// recruiter screen, coding assessment (NeetCode 150 patterns), system design (system-design-primer),
// take-home and live coding. Topics here always show in Learn (see INTERVIEW_TOPICS in index.ts).
type Card =
  | { topic: string; kind: "flashcard" | "practice"; prompt: string; answer: string; script?: string }
  | { topic: string; kind: "mcq"; prompt: string; choices: string[]; correct: number; explanation: string };

const A = "Algorithms";
const S = "System design";
const R = "Recruiter screen";

export const interviewCards: Card[] = [
  // Algorithms (NeetCode 150 patterns)
  { topic: A, kind: "flashcard", prompt: "Hash map: how does it turn Two Sum from O(n²) into O(n)?", answer: "Scan once and store value → index. For each number x, look up target − x in the map; if it is there, you have the pair. O(n) time, O(n) space instead of checking every pair." },
  { topic: A, kind: "flashcard", prompt: "Anagram grouping: what key do you use in the hash map?", answer: "Sorted letters of the word, or a 26-slot letter-count tuple. Words with the same key are anagrams, so map key → list of words. Count keys are O(n·k); sorted keys are O(n·k log k)." },
  { topic: A, kind: "flashcard", prompt: "Two pointers: when does it apply, and what does it cost?", answer: "A sorted array or string, or a pair/palindrome condition. Start pointers at both ends (or both at the start), move one based on a comparison. O(n) time, O(1) space. Examples: Valid Palindrome, Two Sum II, 3Sum, Container With Most Water." },
  { topic: A, kind: "flashcard", prompt: "Sliding window: how do you recognize it and why is it O(n)?", answer: "A contiguous subarray or substring with a constraint (longest, shortest, at most k). Grow the right edge, shrink the left edge while the window is invalid. Each index enters and leaves the window once, so O(n). Example: Longest Substring Without Repeating Characters." },
  { topic: A, kind: "mcq", prompt: "Which data structure fits Valid Parentheses?", choices: ["Queue", "Stack", "Heap", "Trie"], correct: 1, explanation: "The most recently opened bracket must be closed first, which is last in, first out: a stack." },
  { topic: A, kind: "flashcard", prompt: "Monotonic stack: what problems use it?", answer: "Next greater/smaller element, Daily Temperatures, Largest Rectangle in Histogram. Keep the stack ordered; pop while the new element breaks the order. Each element is pushed and popped once, so O(n)." },
  { topic: A, kind: "flashcard", prompt: "Binary search: what is the invariant and the classic bug?", answer: "Keep the answer inside [lo, hi] and shrink it every step. The classic bug is an infinite loop or off-by-one from lo = mid instead of mid + 1. It works on any monotonic condition, not only sorted arrays (e.g. Koko Eating Bananas)." },
  { topic: A, kind: "mcq", prompt: "Binary search over a sorted array of n items takes…", choices: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correct: 1, explanation: "Each step halves the search range, so about log₂ n steps." },
  { topic: A, kind: "flashcard", prompt: "How do you reverse a linked list iteratively?", answer: "Keep prev = null. Loop: save next = cur.next, set cur.next = prev, move prev = cur, cur = next. Return prev. O(n) time, O(1) space." },
  { topic: A, kind: "flashcard", prompt: "How do you detect a cycle in a linked list?", answer: "Floyd's tortoise and hare: a slow pointer moves one step, a fast pointer two. If they ever meet there is a cycle. O(n) time, O(1) space; a hash set of visited nodes works too but uses O(n) space." },
  { topic: A, kind: "flashcard", prompt: "What are the three DFS orders on a binary tree?", answer: "Preorder (node, left, right), inorder (left, node, right; sorted output on a BST) and postorder (left, right, node; children before parent, good for height or deletion)." },
  { topic: A, kind: "flashcard", prompt: "How do you validate a binary search tree correctly?", answer: "Pass (min, max) bounds down the recursion; every node must be strictly inside its bounds. Or check that inorder traversal is strictly increasing. Comparing only a node with its direct children is the common bug." },
  { topic: A, kind: "flashcard", prompt: "BFS vs DFS: when do you pick each?", answer: "BFS (queue) finds the shortest path in an unweighted graph and does level-order traversal. DFS (recursion or stack) suits exploring paths, backtracking, cycle checks and topological order. Both are O(V + E); on graphs keep a visited set." },
  { topic: A, kind: "mcq", prompt: "Shortest path in an unweighted graph: which algorithm?", choices: ["DFS", "BFS", "Binary search", "Union-Find"], correct: 1, explanation: "BFS visits nodes in order of distance from the start, so the first time it reaches a node is the shortest path." },
  { topic: A, kind: "flashcard", prompt: "Heap / priority queue: costs and typical problems?", answer: "Push and pop are O(log n), peek is O(1), building a heap from n items is O(n). Use it for top-k, k-th largest, merge k sorted lists, and the running median (two heaps). Top-k with a size-k min-heap is O(n log k)." },
  { topic: A, kind: "flashcard", prompt: "Backtracking: what is the template?", answer: "Choose, explore, un-choose. Add a candidate, recurse, then remove it; prune branches that cannot work. Used for subsets, permutations, combination sum, N-Queens and word search. Time is often exponential." },
  { topic: A, kind: "flashcard", prompt: "Trie: what is it and what does it cost?", answer: "A prefix tree: each node maps a character to a child and has an end-of-word flag. Insert, search and startsWith are O(L) for word length L, independent of how many words are stored. Used for autocomplete and word search." },
  { topic: A, kind: "flashcard", prompt: "Topological sort: when and how?", answer: "Ordering tasks that have dependencies in a directed acyclic graph (Course Schedule). Kahn's algorithm: count indegrees, queue nodes with zero, remove them and update neighbours. If fewer than n nodes are processed, there is a cycle." },
  { topic: A, kind: "flashcard", prompt: "Union-Find: what is it for?", answer: "Tracking connected components and detecting cycles in undirected graphs (Kruskal's, Redundant Connection). With path compression and union by rank, find and union are nearly O(1) amortized." },
  { topic: A, kind: "flashcard", prompt: "How do you tell a problem needs dynamic programming?", answer: "Overlapping subproblems plus optimal substructure: count the ways, find min/max cost, or decide if something is reachable. Define the state, write the recurrence and base cases, then memoize (top-down) or fill a table (bottom-up). Often you can keep only the last row." },
  { topic: A, kind: "practice", prompt: "Walk through Coin Change (fewest coins) with DP.", answer: "dp[a] = fewest coins to make amount a. dp[0] = 0, others start at infinity. For a from 1 to amount, for each coin c ≤ a: dp[a] = min(dp[a], dp[a − c] + 1). Answer is dp[amount], or −1 if still infinity. O(amount × coins) time, O(amount) space. Greedy fails: coins [1, 3, 4], amount 6 needs 3 + 3, not 4 + 1 + 1." },
  { topic: A, kind: "flashcard", prompt: "Greedy vs DP: how do you choose?", answer: "Greedy takes the locally best choice and never revisits it; it is only correct if you can argue it reaches the global optimum (interval scheduling, Jump Game). If a counterexample exists, use DP." },
  { topic: A, kind: "flashcard", prompt: "Intervals: how do you merge overlapping intervals?", answer: "Sort by start. Walk through: if the current start ≤ the last merged end, extend the end to the max of both; otherwise push a new interval. O(n log n) for the sort." },
  { topic: A, kind: "mcq", prompt: "Time complexity of Merge Intervals using sorting?", choices: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correct: 1, explanation: "The sort dominates; the merge pass afterward is O(n)." },
  { topic: A, kind: "flashcard", prompt: "Kadane's algorithm: what does it solve?", answer: "Maximum Subarray. Track running = max(x, running + x) and best = max(best, running). O(n) time, O(1) space." },
  { topic: A, kind: "flashcard", prompt: "Big-O of common operations: hash map, array, balanced BST, heap?", answer: "Hash map get/set: O(1) average, O(n) worst. Array: index O(1), search O(n), insert in the middle O(n). Balanced BST: search/insert O(log n). Heap: push/pop O(log n), peek O(1)." },
  { topic: A, kind: "practice", prompt: "How do you approach a coding problem you have not seen, live in an interview?", answer: "Restate it and ask about inputs, constraints and edge cases. Work one example by hand. State a brute-force solution and its complexity, then improve it by spotting a pattern (hash map, two pointers, sliding window, heap, DP). Narrate while you code, then test with the example and edge cases (empty, one item, duplicates). Finish by stating time and space. If stuck, say what you tried and ask for a nudge." },

  // System design (system-design-primer)
  { topic: S, kind: "practice", prompt: "What steps do you follow in a system design interview?", answer: "1) Clarify use cases, constraints and assumptions, and do back-of-the-envelope numbers. 2) Sketch the high-level design with every major component. 3) Go deep on the core components. 4) Scale it: find bottlenecks and apply load balancing, caching, replication, sharding and queues. Say your trade-offs aloud." },
  { topic: S, kind: "flashcard", prompt: "Vertical vs horizontal scaling?", answer: "Vertical: a bigger machine; simple but has a ceiling and a single point of failure. Horizontal: more machines behind a load balancer; scales further and survives failures but needs stateless services or shared state." },
  { topic: S, kind: "flashcard", prompt: "What does the CAP theorem say?", answer: "In a distributed store, during a network partition you must choose consistency (every read sees the latest write) or availability (every request gets a response). Without a partition you can have both; the real choice is how the system behaves when links fail." },
  { topic: S, kind: "mcq", prompt: "During a network partition, CAP says you must choose between…", choices: ["Speed and cost", "Consistency and availability", "Reads and writes", "SQL and NoSQL"], correct: 1, explanation: "Partition tolerance is not optional in a distributed system, so the trade-off is consistency vs availability." },
  { topic: S, kind: "flashcard", prompt: "Cache patterns: cache-aside, write-through, write-behind?", answer: "Cache-aside: the app checks the cache, loads from the database on a miss and fills the cache. Write-through: writes go to cache and database together; slower writes, consistent reads. Write-behind: write to the cache and flush to the database later; fast but risks data loss. Invalidation is the hard part." },
  { topic: S, kind: "flashcard", prompt: "Load balancer: layer 4 vs layer 7, and common algorithms?", answer: "Layer 4 routes by IP and port; layer 7 routes by HTTP content (path, headers, cookies). Algorithms: round robin, least connections, hash-based. Use health checks, and run the load balancer redundantly so it is not a single point of failure." },
  { topic: S, kind: "flashcard", prompt: "SQL vs NoSQL: how do you choose?", answer: "SQL: relational data, joins, transactions (ACID), strong schema. NoSQL (key-value, document, wide-column, graph): flexible schema, easy horizontal scaling, often eventual consistency. Decide from access patterns and consistency needs; default to SQL unless you have a clear reason." },
  { topic: S, kind: "flashcard", prompt: "How do you scale a database: replication, sharding, federation?", answer: "Replication: read replicas copy the primary to scale reads and survive failure. Sharding: split rows across nodes by a key to scale writes and storage; watch hot keys and cross-shard queries. Federation: split databases by function (users, orders). Denormalize to avoid joins when reads dominate." },
  { topic: S, kind: "mcq", prompt: "Which technique spreads rows across database nodes by a key?", choices: ["Replication", "Sharding", "Indexing", "Caching"], correct: 1, explanation: "Sharding partitions data by a key so each node holds a slice; replication copies the same data." },
  { topic: S, kind: "flashcard", prompt: "Why put a message queue between services?", answer: "It decouples producers from consumers, absorbs traffic spikes, and allows retries. Delivery is usually at least once, so consumers must be idempotent. Examples: SQS, Pub/Sub, Kafka. Watch queue depth and use a dead-letter queue." },
  { topic: S, kind: "flashcard", prompt: "CDN: push vs pull?", answer: "Push: you upload content to the CDN yourself; good for small, rarely changing sites. Pull: the CDN fetches from your origin on the first request and caches it for a TTL; less work, but the first request is slower." },
  { topic: S, kind: "flashcard", prompt: "Consistent hashing: what problem does it solve?", answer: "With hash(key) % N, adding or removing a node remaps almost every key. Consistent hashing places nodes and keys on a ring so only about 1/N of keys move. Virtual nodes even out the load. Used in caches and sharded stores." },
  { topic: S, kind: "practice", prompt: "How would you rate limit an API?", answer: "Count requests per user or IP in a short window, using a token bucket or sliding window kept in a fast shared store such as Redis. Enforce at the gateway, return 429 with a Retry-After header, and allow different limits per plan. Discuss accuracy vs cost and what happens if the limiter store is down." },
  { topic: S, kind: "flashcard", prompt: "Back-of-the-envelope numbers worth remembering?", answer: "A day is about 10^5 seconds, so 1M requests a day is roughly 12 per second. Order of magnitude: memory read ~100 ns, SSD read ~100 µs, same-datacenter round trip ~0.5 ms, cross-continent ~100+ ms. Use them to size storage, bandwidth and servers." },

  // Recruiter screen (scripts are first-person; [brackets] are for details only Med knows)
  {
    topic: R,
    kind: "practice",
    prompt: "What are your salary expectations?",
    answer: "Research the range for the role and your market first. Give a range, not one number, with the bottom at a figure you would truly accept. State the currency and whether it is monthly or hourly. If they have a budget, ask for it first. Do not apologize for the number.",
    script: "Based on the role and the market, I'm looking for [your monthly range, with currency]. I'm flexible depending on the full package, like benefits and how the work is structured. Can you share the budget for this role so we can see if it fits?",
  },
  {
    topic: R,
    kind: "practice",
    prompt: "What is your notice period, and when can you start?",
    answer: "Give a clear, honest date or range. Mention anything that affects it (current commitments, handover). Do not leave it open-ended.",
    script: "My notice period is [your notice period], so I could start around [date]. I'd want to hand over my current work properly, but I can be flexible if the timeline matters on your side.",
  },
  {
    topic: R,
    kind: "practice",
    prompt: "Why are you looking for a new role?",
    answer: "Keep it positive and forward-looking: what you want more of (scope, growth, product, team), not complaints about the current job. One or two honest reasons, then link them to this role.",
    script: "I've enjoyed my work with Symph since 2020, building full-stack products on Google Cloud and Firebase. I'm looking for [what you want more of, e.g. a product team, bigger scope, AI work], and this role looks like a good match for that.",
  },
  {
    topic: R,
    kind: "practice",
    prompt: "Are you comfortable working remotely across time zones?",
    answer: "Yes, with evidence: how long you have worked remotely, how you communicate in writing, and what overlap hours you can offer. Be specific about your time zone.",
    script: "Yes. I'm based in Davao and I've worked remotely since 2020 with clients and teammates in other time zones. I keep work visible in writing and I'm happy to overlap with your core hours, about [your overlap hours].",
  },
  {
    topic: R,
    kind: "practice",
    prompt: "What questions do you ask the recruiter?",
    answer: "Ask about the hiring process (stages, timeline, who you will meet), the team and what the first 90 days look like, the stack, how success is measured, and the pay range if not yet shared. Asking good questions shows real interest.",
    script: "A few things would help me. What are the interview stages and the timeline? Who would I be working with day to day? What does success look like in the first three months? And is the pay range for this role set yet?",
  },
  {
    topic: R,
    kind: "practice",
    prompt: "Do you have other offers or interviews in progress?",
    answer: "Be honest and brief. Say you are interviewing, do not name other companies, and mention timelines only if it helps both sides. Show this role is a real priority.",
    script: "I'm speaking with a few companies, but this role is one of the ones I'm most interested in because of [reason]. If you can share your timeline, I'll make sure I plan around it.",
  },
];

export const interviewPaths: { title: string; goal: string; skill: string; steps: { title: string; notes: string; url: string }[] }[] = [
  {
    title: "DSA: NeetCode 150",
    goal: "Prepare for coding assessments and live coding by pattern, using the NeetCode 150 list.",
    skill: "Algorithms",
    steps: [
      ["Arrays & Hashing", 9],
      ["Two Pointers", 5],
      ["Stack", 7],
      ["Binary Search", 7],
      ["Sliding Window", 6],
      ["Linked List", 11],
      ["Trees", 15],
      ["Tries", 3],
      ["Heap / Priority Queue", 7],
      ["Backtracking", 9],
      ["Graphs", 13],
      ["Advanced Graphs", 6],
      ["1-D Dynamic Programming", 12],
      ["2-D Dynamic Programming", 11],
      ["Greedy", 8],
      ["Intervals", 6],
      ["Math & Geometry", 8],
      ["Bit Manipulation", 7],
    ].map(([name, count]) => ({
      title: `${name} (${count} problems)`,
      notes: "For each problem: explain the approach aloud first, then code it, then state time and space. Redo missed ones after a week. Review the matching Algorithms cards in Learn.",
      url: "https://neetcode.io/practice/practice/neetcode150",
    })),
  },
  {
    title: "System design: primer",
    goal: "Be able to run a 45-minute system design interview using the system design primer.",
    skill: "System design",
    steps: [
      { title: "Read the primer's study guide and how to approach a design question", notes: "Learn the four-step approach and back-of-the-envelope numbers.", url: "https://github.com/donnemartin/system-design-primer" },
      { title: "Scalability, CAP, consistency and availability patterns", notes: "Be able to explain each trade-off in two sentences.", url: "https://github.com/donnemartin/system-design-primer#system-design-topics-start-here" },
      { title: "Load balancers, caching and CDNs", notes: "Cache-aside vs write-through, layer 4 vs layer 7, push vs pull CDN.", url: "https://github.com/donnemartin/system-design-primer#cache" },
      { title: "Databases: SQL vs NoSQL, replication, sharding", notes: "Know when to pick each and what breaks at scale.", url: "https://github.com/donnemartin/system-design-primer#database" },
      { title: "Asynchronism: queues and back pressure", notes: "At-least-once delivery, idempotent consumers, dead-letter queues.", url: "https://github.com/donnemartin/system-design-primer#asynchronism" },
      { title: "Practice: design a URL shortener (Pastebin) out loud in 30 minutes", notes: "Record yourself or write the steps; compare with the primer's solution.", url: "https://github.com/donnemartin/system-design-primer#design-pastebincom-or-bitlyus" },
      { title: "Practice: design a news feed / Twitter timeline out loud", notes: "Fan-out on write vs read, caching the timeline.", url: "https://github.com/donnemartin/system-design-primer#design-the-twitter-timeline-and-search-or-facebook-feed-and-search" },
      { title: "Practice: design a rate limiter and a web crawler", notes: "Token bucket in Redis; queue-based crawler with dedupe.", url: "https://github.com/donnemartin/system-design-primer#design-a-web-crawler" },
    ],
  },
  {
    title: "Take-home and live coding",
    goal: "Be ready for a 3 to 5 day take-home project and a live pair-programming round.",
    skill: "Take-home",
    steps: [
      { title: "Build a small CRUD app in 3 hours (Next.js + API + Postgres)", notes: "Timed. Include a README with run steps, seed data, input validation and a few tests.", url: "" },
      { title: "Take-home checklist", notes: "README with setup and decisions, tests for the main paths, clear error handling, small commits, and a short 'what I would do next' section.", url: "" },
      { title: "Debug a broken API in 45 minutes", notes: "Take a small Express or NestJS API with three planted bugs. Practice reading logs, reproducing, then fixing while explaining aloud.", url: "" },
      { title: "Live coding rehearsal: solve one problem aloud in 30 minutes", notes: "Use the 'new problem' approach card in Learn: clarify, example, brute force, improve, code, test.", url: "" },
      { title: "Walk through your take-home code as if to a senior engineer", notes: "Be ready to justify architecture, trade-offs and what you would change with more time.", url: "" },
    ],
  },
];
