// Mirrors public.normalize_job_url (supabase/migrations/*_job_posts.sql), which computes job_posts.url_norm.
// The database stays the authority; this only lets the client spot a duplicate link before saving.
// Returns null where the database would raise invalid_job_url.

// Lowercased names. utm_* is matched by prefix. Keep the same set in normalize_job_url.
const TRACKING_PARAMS = new Set([
  "fbclid", "gclid", "gbraid", "wbraid", "dclid", "msclkid", "mc_cid", "mc_eid",
  "igshid", "yclid", "twclid", "ttclid", "li_fat_id", "gclsrc", "gad_source",
  "gad_campaignid", "_ga", "_gl", "ref", "refid", "trackingid", "trk", "trkinfo",
  "lipi", "originalsubdomain", "original_referer", "ebp", "origin", "si", "mcid",
  "_hsenc", "_hsmi", "mkt_tok", "rb_clickid", "irclickid", "hsa_acc", "hsa_cam",
  "hsa_grp", "hsa_ad", "hsa_src", "hsa_tgt", "hsa_kw", "hsa_mt", "hsa_net", "hsa_ver",
]);

// The database sorts params with its en-US collation; break ties by code unit like a deterministic collation.
const collator = new Intl.Collator("en-US");
const compareText = (a: string, b: string) => collator.compare(a, b) || (a < b ? -1 : a > b ? 1 : 0);

const utf8 = new TextEncoder();
const strictUtf8 = new TextDecoder("utf-8", { fatal: true });

// Form encoding: letters, digits and * - . _ stay; a space becomes +; every other UTF-8 byte is %XX.
function encodePart(value: string) {
  let out = "";
  for (const byte of utf8.encode(value)) {
    if (byte === 32) {
      out += "+";
    } else if (/[0-9A-Za-z*\-._]/.test(String.fromCharCode(byte))) {
      out += String.fromCharCode(byte);
    } else {
      out += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    }
  }
  return out;
}

// + is a space and %XX a byte; a stray % stays literal. Bytes that are not valid UTF-8 make the link invalid.
function decodePart(value: string): string | null {
  const text = value.replaceAll("+", " ");
  const bytes: number[] = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === "%" && /^[0-9A-Fa-f]{2}$/.test(text.slice(i + 1, i + 3))) {
      bytes.push(parseInt(text.slice(i + 1, i + 3), 16));
      i += 3;
    } else {
      const char = String.fromCodePoint(text.codePointAt(i) ?? 0);
      bytes.push(...utf8.encode(char));
      i += char.length;
    }
  }
  // Postgres text cannot hold a NUL byte.
  if (bytes.includes(0)) {
    return null;
  }
  try {
    return strictUtf8.decode(new Uint8Array(bytes));
  } catch {
    return null;
  }
}

function linkedInJobId(path: string, query: string) {
  for (const pair of query.split("&")) {
    const match = /^currentJobId=([0-9]+)$/i.exec(pair);
    if (match) {
      return match[1];
    }
  }
  const segment = /^\/jobs\/view\/([^/]+)\/?$/.exec(path)?.[1];
  if (segment && (/^[0-9]+$/.test(segment) || /^.+-[0-9]+$/.test(segment))) {
    return /([0-9]+)$/.exec(segment)?.[1] ?? null;
  }
  return null;
}

export function normalizeJobUrl(raw: string): string | null {
  const input = raw.replace(/^ +| +$/g, "");
  if (input === "" || /\s/.test(input) || !/^https?:\/\//i.test(input)) {
    return null;
  }

  const scheme = input.slice(0, input.indexOf(":")).toLowerCase();
  let rest = input.slice(input.indexOf("://") + 3);

  const hashPos = rest.indexOf("#");
  if (hashPos >= 0) {
    rest = rest.slice(0, hashPos);
  }
  let query = "";
  const queryPos = rest.indexOf("?");
  if (queryPos >= 0) {
    query = rest.slice(queryPos + 1);
    rest = rest.slice(0, queryPos);
  }

  const slashPos = rest.indexOf("/");
  let authority = slashPos < 0 ? rest : rest.slice(0, slashPos);
  let path = slashPos < 0 ? "/" : rest.slice(slashPos);
  if (authority === "") {
    return null;
  }
  authority = authority.replace(/^.*@/, "");

  let port = /:(\d+)$/.exec(authority)?.[1] ?? "";
  const host = authority.replace(/:\d+$/, "").replace(/\.+$/, "").toLowerCase();
  if (host === "" || /[^a-z0-9.-]/.test(host)) {
    return null;
  }
  if ((scheme === "https" && port === "443") || (scheme === "http" && port === "80")) {
    port = "";
  }
  if (path === "") {
    path = "/";
  }

  const bareHost = host.replace(/^www\./, "");
  if (bareHost === "linkedin.com" || bareHost.endsWith(".linkedin.com")) {
    const jobId = linkedInJobId(path, query);
    if (jobId) {
      return `https://www.linkedin.com/jobs/view/${jobId}/`;
    }
  }

  if (query !== "") {
    const params: [string, string][] = [];
    for (const piece of query.split("&")) {
      if (piece === "") {
        continue;
      }
      const eqPos = piece.indexOf("=");
      const key = decodePart(eqPos < 0 ? piece : piece.slice(0, eqPos));
      const value = decodePart(eqPos < 0 ? "" : piece.slice(eqPos + 1));
      if (key === null || value === null) {
        return null;
      }
      const lowerKey = key.toLowerCase();
      if (lowerKey.startsWith("utm_") || TRACKING_PARAMS.has(lowerKey)) {
        continue;
      }
      params.push([key, value]);
    }
    query = params
      .sort(([keyA, valueA], [keyB, valueB]) => compareText(keyA, keyB) || compareText(valueA, valueB))
      .map(([key, value]) => `${encodePart(key)}=${encodePart(value)}`)
      .join("&");
  }

  if (path.length > 1) {
    path = path.replace(/\/+$/, "");
  }

  return `${scheme}://${host}${port ? `:${port}` : ""}${path}${query ? `?${query}` : ""}`;
}
