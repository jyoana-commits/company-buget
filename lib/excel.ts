/**
 * Loads budget grid rows from MySQL (Budget table: studio + year).
 * Used by budget pages; data is written by the upload API from .xlsx files.
 */

import { prisma } from "@/lib/prisma";
import { BUDGET_YEAR } from "@/lib/budget";

/**
 * Loads the budget rows for a studio. Tries the given year first;
 * if no row exists, falls back to the latest year for that studio.
 * Returns empty array on error or missing data.
 */
export async function loadBudgetFromXlsx(
  studioName: string,
  year: number = BUDGET_YEAR
): Promise<string[][]> {
  try {
    const studio = studioName.toUpperCase();

    let doc = await prisma.budget.findUnique({
      where: { studio_year: { studio, year } },
    });
    if (!doc) {
      doc = await prisma.budget.findFirst({
        where: { studio },
        orderBy: { year: "desc" },
      });
    }
    if (!doc || !Array.isArray(doc.rows)) return [];
    return doc.rows as string[][];
  } catch (err) {
    console.error("[excel] Failed to load budget from DB for", studioName, err);
    return [];
  }
}
