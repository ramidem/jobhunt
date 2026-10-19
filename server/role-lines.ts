// Turns the free-text qualification lines of a role into degree text, tech skill pills and
// soft-skill bullets. Kept as a read-time view so the raw lines stay untouched in the database.

// A line is a degree line when it starts with an education word, or is short and mentions one
// ("Degree, Certs", "Masters/PhD", "High School or College Degree").
const DEGREE_START = /^(degree|bachelor|master|ph\.?\s?d|high\s?school|college|diploma|associate|education)/i;
const DEGREE = /\b(degree|bachelor'?s?|masters?|ph\.?\s?d|high\s?school|college|diploma)\b/i;

const SOFT =
  /\b(communicat\w*|abilit(y|ies)|teamwork|team player|work(s|ing)? with|takes direction|criticism|multi-?task\w*|deadlines?|stakeholders?|leadership|leading|lead\b|collaborat\w*|problem[- ]solv\w*|solved|present\w*|explain\w*|organi[sz]\w*|hunger|grind|attitude|self[- ]starter|detail\w*|curious|curiosity|mentor\w*|cross[- ]functional|people|customer service|interpersonal|adaptab\w*|ownership|initiative|time management|prioriti[sz]\w*|independent\w*|speak|understand\w*)\b/i;

// Labels that introduce a list rather than name a skill.
const PREFIX = /^(bonus|nice to have|plus|preferred|basic swe|one of the following[\w\s]*|such as|e\.g\.?)\s*:\s*/i;

// Splits on commas/semicolons that are not inside parentheses.
function splitTopLevel(text: string) {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of text) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if ((char === "," || char === ";") && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
}

function cleanSkill(raw: string) {
  let value = raw.trim().replace(/^(and|or|&)\s+/i, "").replace(/[.,;:]+$/, "").trim();
  // Close a parenthesis the source left open: "Infrastructure-as-Code (e.g. Pulumi, Terraform".
  if ((value.match(/\(/g) ?? []).length > (value.match(/\)/g) ?? []).length) {
    value += ")";
  }
  return value;
}

export type RoleView = {
  degree: string[];
  skills: { name: string; optional: boolean }[];
  soft: string[];
};

export function classifyLines(lines: string[]): RoleView {
  const view: RoleView = { degree: [], skills: [], soft: [] };
  const seen = new Set<string>();
  for (const line of lines) {
    const text = line.trim();
    if (!text) continue;
    if (DEGREE_START.test(text) || (DEGREE.test(text) && text.length <= 40)) {
      view.degree.push(text);
      continue;
    }
    if (SOFT.test(text)) {
      view.soft.push(text);
      continue;
    }
    const optional = /^(bonus|nice to have|plus|preferred)\b/i.test(text);
    const parts = splitTopLevel(text.replace(PREFIX, "")).flatMap((part) => {
      const trimmed = part.trim();
      // "(Java Script, HTML)" is a list in brackets, not one skill.
      return /^\(.*\)$/.test(trimmed) ? splitTopLevel(trimmed.slice(1, -1)) : [part];
    });
    for (const part of parts) {
      const name = cleanSkill(part);
      const key = name.toLowerCase();
      if (name && !/^etc\.?$/i.test(name) && !seen.has(key)) {
        seen.add(key);
        view.skills.push({ name, optional });
      }
    }
  }
  return view;
}
