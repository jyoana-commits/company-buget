/**
 * Shared constants for budget table styling (Complete, Summary, Combined).
 * Single source for gray-row labels and variance cell colors.
 */

/** Row labels that get a gray background; Variance column keeps its own good/bad color. */
export const GRAY_ROW_LABELS = new Set<string>([
  "Total Staff Costs",
  "Other Expenses",
  "Total Costs",
  "Total Billable",
]);

/** Variance cell: good (empty, zero, or ≥ 0). Excel-style green. */
export const VARIANCE_BG_GOOD = " !bg-[#c6efce] dark:!bg-green-900/50";
/** Variance cell: bad (only when < 0). Excel-style red. */
export const VARIANCE_BG_BAD = " !bg-[#ffc7ce] dark:!bg-red-950/50";
/** Variance text when good. */
export const VARIANCE_TEXT_GOOD = " text-green-800 dark:text-green-300 font-semibold";
/** Variance text when bad. */
export const VARIANCE_TEXT_BAD = " text-red-800 dark:text-red-300 font-semibold";

/** Sticky first column (label): base classes for header and body. */
export const STICKY_FIRST_COL =
  "sticky left-0 z-10 min-w-[8rem] border-[1.5px] border-slate-300 px-2 py-0.5 text-zinc-900 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] dark:border-slate-600 dark:text-zinc-100 dark:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.35)] isolate relative before:absolute before:inset-y-0 before:right-full before:w-[100vw] before:content-['']";
/** First column header (thead). */
export const STICKY_FIRST_COL_HEADER =
  "sticky left-0 z-20 min-w-[8rem] border-[1.5px] border-slate-300 border-r-[2px] border-r-slate-400 bg-slate-100 px-2 py-0.5 text-left font-bold text-slate-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)] dark:border-slate-600 dark:border-r-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.4)] isolate relative before:absolute before:inset-y-0 before:right-full before:w-[100vw] before:bg-slate-100 before:content-[''] dark:before:bg-slate-800";
/** Empty row first cell (matches Complete non-label first col). */
export const EMPTY_ROW_FIRST_CELL =
  "sticky left-0 z-10 min-w-[8rem] border-[1.5px] border-slate-300 px-2 py-2 text-zinc-900 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] dark:border-slate-600 dark:text-zinc-100 dark:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.35)] isolate relative before:absolute before:inset-y-0 before:right-full before:w-[100vw] before:bg-white before:content-[''] dark:before:bg-zinc-900 !bg-white dark:!bg-zinc-900";

/** Good = empty, zero, or positive. Bad = only negative. */
export function isVarianceGood(value: number): boolean {
  return typeof value !== "number" || Number.isNaN(value) || value >= 0;
}

export function isVarianceBad(value: number): boolean {
  return typeof value === "number" && !Number.isNaN(value) && value < 0;
}
