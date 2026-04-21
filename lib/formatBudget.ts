/**
 * Shared display formatting for budget tables (Complete and Summary).
 * Excel-style: round half up, integer with #,##0, zero as "-".
 */

export function parseBudgetNumber(value: string): number {
  if (!value) return NaN;
  const cleaned = value.toString().replace(/,/g, "").replace(/[^\d.\-]/g, "");
  const n = Number(cleaned);
  return Number.isNaN(n) ? NaN : n;
}

/**
 * Round to nearest integer; 0.5 rounds up to 1 (and -0.5 rounds to -1).
 */
export function roundHalfUp(n: number): number {
  return n >= 0 ? Math.floor(n + 0.5) : Math.ceil(n - 0.5);
}

/**
 * Format like Excel "_-* #,##0_-;-* #,##0_-;_-* "-"??_-;_-@"
 * Round to nearest integer (.5 rounds up). Zero → "-". Non-numbers → as-is.
 */
export function formatBudgetValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "\u00A0";
  const s = String(value).trim();
  if (!s) return "\u00A0";
  const n = parseBudgetNumber(s);
  if (Number.isNaN(n)) return s;
  const rounded = roundHalfUp(n);
  if (rounded === 0) return "-";
  const abs = Math.abs(rounded);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return rounded < 0 ? `-${formatted}` : formatted;
}
