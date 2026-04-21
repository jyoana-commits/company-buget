/**
 * Budget grid normalization: raw sheet rows → trimmed grid of line items.
 * Expects columns: label, then per month (Budget, Actual, Variance) × 12.
 * Only rows whose first cell matches LINE_ITEMS are kept.
 */

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** First-column labels that identify data rows in the budget sheet. */
export const LINE_ITEMS = new Set<string>([
  "Salaries", "On-Costs (benefits, 401k)", "Sign-on Bonus", "Bonuses / Retention",
  "Payroll Taxes", "Total Staff Costs", "Outsource Audio", "Outsource Art & Animation",
  "Outsource Dev (provision)", "Insurance and local prof services",
  "Accounting, Tax filing and admin", "Office Expenses", "Hardware",
  "Set-up costs (legal, TP policy, etc.)", "Travel", "Software Subscriptions",
  "Other Expenses", "Total Costs", "Margin", "Total Billable",
]);

export type BudgetGrid = { rows: string[][] };

/**
 * Normalizes raw budget rows into a grid: pad columns, drop empty rows,
 * keep only the slice from first to last LINE_ITEMS row, and limit to
 * label + 12 months × (Budget, Actual, Variance).
 */
export function buildBudgetGrid(rawRows: string[][]): BudgetGrid {
  if (rawRows.length === 0) return { rows: [] };

  const maxCols = rawRows.reduce((max, row) => (row.length > max ? row.length : max), 0);
  const normalizedRows = rawRows
    .map((row) => {
      const out = [...row];
      while (out.length < maxCols) out.push("");
      return out;
    })
    .filter((row) => row.some((cell) => String(cell).trim() !== ""));

  // Find first row that is a known line item
  let firstDataRowIndex = normalizedRows.findIndex((row) =>
    LINE_ITEMS.has(String(row[0]).trim())
  );
  if (firstDataRowIndex === -1) firstDataRowIndex = 0;

  // Find last row that is a known line item
  let lastDataRowIndex = -1;
  for (let i = normalizedRows.length - 1; i >= 0; i -= 1) {
    if (LINE_ITEMS.has(String(normalizedRows[i][0]).trim())) {
      lastDataRowIndex = i;
      break;
    }
  }
  if (lastDataRowIndex === -1) lastDataRowIndex = normalizedRows.length - 1;

  const dataPortion = normalizedRows.slice(firstDataRowIndex, lastDataRowIndex + 1);
  const maxBudgetCols = 1 + 3 * 12;
  const colLimit = Math.min(maxCols, maxBudgetCols);
  const rows = dataPortion.map((row) => row.slice(0, colLimit));

  return { rows };
}
