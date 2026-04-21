/**
 * Renders the full budget grid (label + 12 months × Budget/Actual/Variance).
 * Used on the studio "Complete" page. Normalizes rows via buildBudgetGrid and
 * styles variance cells (green/red) and numeric alignment.
 */
import React from "react";
import { LINE_ITEMS, MONTHS, buildBudgetGrid } from "@/lib/budgetGrid";
import {
  formatBudgetValue,
  parseBudgetNumber,
  roundHalfUp,
} from "@/lib/formatBudget";
import {
  GRAY_ROW_LABELS,
  VARIANCE_BG_GOOD,
  VARIANCE_BG_BAD,
  VARIANCE_TEXT_GOOD,
  VARIANCE_TEXT_BAD,
} from "@/lib/budgetTableConstants";

type Props = { rawRows: string[][] };

export function BudgetTable({ rawRows }: Props) {
  const { rows } = buildBudgetGrid(rawRows);
  if (rows.length === 0) return null;

  return (
    <table className="w-full min-w-max border-collapse whitespace-nowrap text-[11px] font-mono text-zinc-900 dark:text-zinc-100">
        <thead>
          <tr>
            <th className="sticky left-0 z-20 min-w-[8rem] border-[1.5px] border-slate-300 bg-slate-100 px-2 py-0.5 text-zinc-900 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)] dark:border-slate-600 dark:bg-slate-800 dark:text-zinc-100 dark:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.4)] isolate relative before:absolute before:inset-y-0 before:right-full before:w-[100vw] before:bg-slate-100 before:content-[''] dark:before:bg-slate-800" />
            {MONTHS.map((month, monthIdx) => (
              <th
                key={month}
                colSpan={3}
                className={`border-[1.5px] border-slate-300 bg-slate-100 px-1.5 py-0.5 text-center font-bold uppercase tracking-wide text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 ${monthIdx > 0 ? "border-l-[3px] border-l-slate-400 dark:border-l-slate-500" : ""}`}
              >
                {month}
              </th>
            ))}
          </tr>
          <tr>
            <th className="sticky left-0 z-20 min-w-[8rem] border-[1.5px] border-slate-300 bg-slate-100 px-2 py-0.5 text-zinc-900 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)] dark:border-slate-600 dark:bg-slate-800 dark:text-zinc-100 dark:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.4)] isolate relative before:absolute before:inset-y-0 before:right-full before:w-[100vw] before:bg-slate-100 before:content-[''] dark:before:bg-slate-800" />
            {MONTHS.map((month, idx) => (
              <React.Fragment key={`${month}-${idx}`}>
                <th className="border-[1.5px] border-slate-300 bg-slate-50 px-1.5 py-0.5 text-center text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200">Budget</th>
                <th className="border-[1.5px] border-slate-300 bg-slate-50 px-1.5 py-0.5 text-center text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200">Actual</th>
                <th className="border-l-[3px] border-slate-400 border-r-[1.5px] border-slate-300 bg-slate-100 px-1.5 py-0.5 text-center text-xs font-bold text-slate-800 dark:border-l-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">Variance</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cols, rowIndex) => {
            const isDataRow = cols.length > 1 && LINE_ITEMS.has(String(cols[0]).trim());
            const label = String(cols[0] ?? "").trim();
            const isGrayRow = isDataRow && GRAY_ROW_LABELS.has(label);
            const rowStrip =
              isGrayRow
                ? " bg-slate-200 dark:bg-slate-700"
                : isDataRow && rowIndex % 2 === 1
                  ? " bg-slate-50/60 dark:bg-slate-800/30"
                  : "";
            return (
              <tr key={rowIndex} className={rowStrip}>
                {cols.map((cell, colIndex) => {
                  const content = cell;
                  const isLabelCell = isDataRow && colIndex === 0;
                  const isValueCell = isDataRow && colIndex > 0;
                  const groupIndex = colIndex > 0 ? (colIndex - 1) % 3 : -1;
                  const isVarianceColumn = colIndex > 0 && groupIndex === 2;
                  const isVarianceCell = isVarianceColumn && isDataRow;
                  const CellTag: "th" | "td" = isLabelCell ? "th" : "td";
                  const numeric = parseBudgetNumber(typeof content === "string" ? content : String(content));
                  const alignRight = !isLabelCell && !Number.isNaN(numeric) && String(content).trim() !== "";

                  let varianceNumeric = NaN;
                  if (isVarianceColumn && isDataRow) {
                    const fromCell = parseBudgetNumber(String(content));
                    if (!Number.isNaN(fromCell)) {
                      varianceNumeric = fromCell;
                    } else {
                      const groupStart = colIndex - 2;
                      const budgetRaw = rows[rowIndex]?.[groupStart] ?? "";
                      const actualRaw = rows[rowIndex]?.[groupStart + 1] ?? "";
                      const budgetNum = parseBudgetNumber(typeof budgetRaw === "string" ? budgetRaw : String(budgetRaw));
                      const actualNum = parseBudgetNumber(typeof actualRaw === "string" ? actualRaw : String(actualRaw));
                      if (!Number.isNaN(budgetNum) && !Number.isNaN(actualNum))
                        varianceNumeric = roundHalfUp(budgetNum) - roundHalfUp(actualNum);
                    }
                  }

                  const isFirstCol = colIndex === 0;
                  const stickyFirstCol = isFirstCol
                    ? " sticky left-0 z-10 min-w-[8rem] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] dark:shadow-[4px_0_8px_-2px_rgba(0,0,0,0.35)] isolate relative before:absolute before:inset-y-0 before:right-full before:w-[100vw] before:content-['']"
                    : "";
                  const firstColCurtain =
                    isFirstCol && isLabelCell
                      ? isGrayRow
                        ? " before:bg-slate-200 dark:before:bg-slate-700"
                        : " before:bg-slate-50 dark:before:bg-slate-800"
                      : isFirstCol
                        ? " before:bg-white dark:before:bg-zinc-900"
                        : "";
                  const firstColBg =
                    isFirstCol && !isLabelCell
                      ? isGrayRow
                        ? " !bg-slate-200 dark:!bg-slate-700"
                        : " !bg-white dark:!bg-zinc-900"
                      : "";
                  const baseClasses =
                    "border-[1.5px] border-slate-300 px-2 py-0.5 text-zinc-900 dark:border-slate-600 dark:text-zinc-100" +
                    stickyFirstCol +
                    firstColCurtain +
                    firstColBg;
                  const labelClasses = isLabelCell
                    ? ` font-semibold border-r-[2px] border-r-slate-400 ${isGrayRow ? "!bg-slate-200 dark:!bg-slate-700" : "!bg-slate-50 dark:!bg-slate-800"} dark:border-r-slate-500`
                    : "";
                  const alignClasses = alignRight ? " text-right tabular-nums" : "";
                  const varianceBorder = isVarianceColumn ? " border-l-[3px] border-l-slate-400 dark:border-l-slate-500" : "";
                  // Good = empty, zero, or positive. Bad = only negative. Non-data rows (spacer/empty) = good.
                  const isVarianceGood =
                    isVarianceColumn &&
                    (!isDataRow || Number.isNaN(varianceNumeric) || varianceNumeric >= 0);
                  const isVarianceBad = isVarianceColumn && isDataRow && !Number.isNaN(varianceNumeric) && varianceNumeric < 0;
                  const varianceCellBg = isVarianceColumn ? (isVarianceGood ? VARIANCE_BG_GOOD : VARIANCE_BG_BAD) : "";
                  const varianceClasses = isVarianceGood ? VARIANCE_TEXT_GOOD : isVarianceBad ? VARIANCE_TEXT_BAD : "";

                  const displayValue =
                    isFirstCol
                      ? (String(content).trim() || "\u00A0")
                      : isVarianceCell && label === "Total Billable"
                        ? formatBudgetValue(content)
                        : isVarianceCell && !Number.isNaN(varianceNumeric)
                          ? formatBudgetValue(varianceNumeric)
                          : formatBudgetValue(content);
                  return (
                    <CellTag key={colIndex} className={baseClasses + labelClasses + varianceCellBg + varianceBorder + varianceClasses + alignClasses}>
                      {displayValue}
                    </CellTag>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
  );
}
