// Turns a free-text pay string ("PHP 90,000 - PHP 93,000 a month", "USD 46-48K/year") into an
// estimated monthly range in PHP so postings can be compared and filtered. Rough on purpose:
// non-PHP currencies use fixed approximate rates, hourly pay assumes 160 hours a month.
const RATES: Record<string, number> = { PHP: 1, USD: 58, AUD: 38, EUR: 63, GBP: 74, SGD: 43 };

export type MonthlyPay = { min: number | null; max: number; hourly: boolean } | null;

export function parseMonthlyPhp(raw: string): MonthlyPay {
  const text = raw.replace(/–|—/g, "-");
  if (!text.trim()) return null;
  const currency =
    (/(?:₱|php)/i.test(text) && "PHP") ||
    (text.match(/\b(USD|AUD|EUR|GBP|SGD)\b/i)?.[1].toUpperCase() ?? null) ||
    (text.includes("$") ? "USD" : null);
  if (!currency) return null;

  // Numbers like 90,000 / 46-48K / 4,703.51
  const numbers = [...text.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*([kK])?/g)]
    .map((match) => Number(match[1].replace(/,/g, "")) * (match[2] ? 1000 : 1))
    .filter((value) => value > 0);
  if (numbers.length === 0) return null;
  // "46-48K": the K applies to both ends.
  if (/\d\s*-\s*\d+\s*[kK]\b/.test(text) && numbers[0] < 1000) {
    numbers.forEach((_, index) => (numbers[index] = numbers[index] < 1000 ? numbers[index] * 1000 : numbers[index]));
  }
  const low = Math.min(numbers[0], numbers[numbers.length > 1 ? 1 : 0]);
  const high = Math.max(numbers[0], numbers[numbers.length > 1 ? 1 : 0]);
  const open = /^\s*up to/i.test(text); // "Up to 70,000" has no lower bound
  const from = /^\s*from/i.test(text);

  let period = 1; // monthly
  if (/hour|\/hr|hourly/i.test(text)) period = 160;
  else if (/year|annum|annual|\/yr/i.test(text)) period = 1 / 12;
  else if (/week/i.test(text)) period = 4.33;
  else if (/day/i.test(text)) period = 22;
  // "PHP 70,000 an hour" is really monthly: no one pays that per hour.
  if (period === 160 && currency === "PHP" && high >= 20000) period = 1;

  const rate = RATES[currency] ?? 1;
  const max = Math.round((from ? low : high) * period * rate);
  // "Up to X" has no known floor; "From X" has no known ceiling, so X is both ends.
  const min = open ? null : Math.round(low * period * rate);
  return { min: from ? max : min, max, hourly: period === 160 };
}
