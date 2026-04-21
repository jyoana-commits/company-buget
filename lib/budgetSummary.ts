/**
 * Budget summary logic: YTD totals and monthly totals from raw grid rows.
 * Uses budgetGrid for normalization; reads "latest month" from actuals to compute YTD.
 */

import { LINE_ITEMS, MONTHS, buildBudgetGrid } from "@/lib/budgetGrid";
import { prisma } from "@/lib/prisma";
import { BUDGET_YEAR } from "@/lib/budget";

/** Parses a cell value to a number (strips commas and non-numeric chars). */
const parseNumber = (value: string): number => {
  if (!value) return NaN;
  const cleaned = value.toString().replace(/,/g, "").replace(/[^\d.\-]/g, "");
  const n = Number(cleaned);
  return Number.isNaN(n) ? NaN : n;
};

export type SummaryRow = {
  label: string;
  budgetTotal: number;
  actualTotal: number;
  varianceTotal: number;
};

export type BudgetSummary = {
  rows: SummaryRow[];
  latestMonthIndex: number;
};

export type MonthlyTotal = {
  monthIndex: number;
  budget: number;
  actual: number;
};

/**
 * Builds YTD summary rows from raw grid: for each line item, sums budget and actual
 * up to the latest month that has actuals, and computes variance.
 */
export function buildBudgetSummary(rawRows: string[][]): BudgetSummary {
  const { rows } = buildBudgetGrid(rawRows);
  if (rows.length === 0) return { rows: [], latestMonthIndex: -1 };

  let latestMonthIndex = -1;
  let isActualFullMonth = true;

  // Determine latest month index where all data rows have an actual value
  rows.forEach((cols) => {
    const isDataRow = cols.length > 1 && LINE_ITEMS.has(String(cols[0]).trim());
    if (!isDataRow) return;
    for (let monthIndex = 0; monthIndex < MONTHS.length; monthIndex += 1) {
      const actualCol = 1 + monthIndex * 3 + 1;
      const actualRaw = cols[actualCol] ?? "";
      const actualNum = parseNumber(actualRaw);
      if (Number.isNaN(actualNum)) {
        isActualFullMonth = false;
        latestMonthIndex = Math.max(latestMonthIndex, monthIndex);
        break;
      }
    }
    if (!isActualFullMonth) return;
  });

  if (latestMonthIndex === -1) latestMonthIndex = 0;

  const summaryRows: SummaryRow[] = [];
  rows.forEach((cols) => {
    const label = String(cols[0] ?? "").trim();
    const isDataRow = label.length > 0 && LINE_ITEMS.has(label) && cols.length > 1;
    if (!isDataRow) return;
    let budgetTotal = 0;
    let actualTotal = 0;
    for (let monthIndex = 0; monthIndex <= latestMonthIndex; monthIndex += 1) {
      const budgetCol = 1 + monthIndex * 3;
      const actualCol = budgetCol + 1;
      const budgetNum = parseNumber(cols[budgetCol] ?? "");
      const actualNum = parseNumber(cols[actualCol] ?? "");
      if (!Number.isNaN(budgetNum)) budgetTotal += budgetNum;
      if (!Number.isNaN(actualNum)) actualTotal += actualNum;
    }
    summaryRows.push({ label, budgetTotal, actualTotal, varianceTotal: budgetTotal - actualTotal });
  });

  return { rows: summaryRows, latestMonthIndex };
}

/** Per-month budget and actual totals for charting (all line items summed per month). */
export function buildMonthlyTotals(rawRows: string[][]): MonthlyTotal[] {
  const { rows } = buildBudgetGrid(rawRows);
  const totals: MonthlyTotal[] = MONTHS.map((_, monthIndex) => ({ monthIndex, budget: 0, actual: 0 }));

  rows.forEach((cols) => {
    const label = String(cols[0] ?? "").trim();
    const isDataRow = label.length > 0 && LINE_ITEMS.has(label) && cols.length > 1;
    if (!isDataRow) return;
    MONTHS.forEach((_, monthIndex) => {
      const budgetCol = 1 + monthIndex * 3;
      const actualCol = budgetCol + 1;
      const budgetNum = parseNumber(cols[budgetCol] ?? "");
      const actualNum = parseNumber(cols[actualCol] ?? "");
      if (!Number.isNaN(budgetNum)) totals[monthIndex].budget += budgetNum;
      if (!Number.isNaN(actualNum)) totals[monthIndex].actual += actualNum;
    });
  });
  return totals;
}

/** Returns the last update time for a studio's budget row, or null. */
export async function getBudgetFileModifiedAt(
  studioName: string,
  year: number = BUDGET_YEAR
): Promise<Date | null> {
  try {
    const doc = await prisma.budget.findUnique({
      where: { studio_year: { studio: studioName.toUpperCase(), year } },
      select: { updatedAt: true },
    });
    if (!doc?.updatedAt) return null;
    return doc.updatedAt;
  } catch {
    return null;
  }
}
