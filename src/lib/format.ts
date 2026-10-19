// Formats a YYYY-MM-DD date as "Oct 19" (adds the year when it isn't this year).
export function formatDay(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

const k = (value: number) => (value >= 1000 ? `${Math.round(value / 100) / 10}k`.replace(".0k", "k") : String(value));

// "₱90–93k/mo" from an estimated monthly range. Open-ended ranges read "up to" and "from".
export function formatMonthlyPay(min: number | null, max: number | null) {
  if (max === null) return "";
  if (min === null) return `up to ₱${k(max)}/mo`;
  if (min === max) return `₱${k(max)}/mo`;
  return `₱${k(min)}–${k(max)}/mo`;
}
