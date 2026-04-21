/**
 * Reusable YTD summary table: same layout, colors, and display rules as
 * studio Summary and Combined summary. Uses shared constants and formatBudgetValue.
 */
import type { SummaryRow } from "@/lib/budgetSummary";
import { formatBudgetValue } from "@/lib/formatBudget";
import {
  GRAY_ROW_LABELS,
  VARIANCE_BG_GOOD,
  VARIANCE_BG_BAD,
  VARIANCE_TEXT_GOOD,
  VARIANCE_TEXT_BAD,
  STICKY_FIRST_COL_HEADER,
  STICKY_FIRST_COL,
  EMPTY_ROW_FIRST_CELL,
  isVarianceGood,
} from "@/lib/budgetTableConstants";

const TH_BASE = "border-[1.5px] border-slate-300 bg-slate-100 px-4 py-2.5 text-right font-bold tabular-nums text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const TD_BASE = "border-[1.5px] border-slate-300 px-4 py-2 text-right tabular-nums text-zinc-900 dark:border-slate-600 dark:text-zinc-100";
const TD_EMPTY = "border-[1.5px] border-slate-300 px-4 py-2 dark:border-slate-600";

export type SummaryTableProps = {
  summaryRows: SummaryRow[];
};

function emptyRow(key: string) {
  return (
    <tr key={key} aria-hidden>
      <td className={EMPTY_ROW_FIRST_CELL}>{"\u00A0"}</td>
      <td className={TD_EMPTY} />
      <td className={TD_EMPTY} />
      <td className={`${TD_EMPTY} ${VARIANCE_BG_GOOD} ${VARIANCE_TEXT_GOOD}`} />
    </tr>
  );
}

export function SummaryTable({ summaryRows }: SummaryTableProps) {
  return (
    <table className="w-full border-collapse text-xs text-zinc-900 dark:text-zinc-100">
      <thead>
        <tr>
          <th className={STICKY_FIRST_COL_HEADER}>Line item</th>
          <th className={TH_BASE}>Budget YTD</th>
          <th className={TH_BASE}>Actual YTD</th>
          <th className={`${TH_BASE} dark:text-slate-200`}>Variance YTD</th>
        </tr>
      </thead>
      <tbody>
        {summaryRows.flatMap((row, idx) => {
          const good = isVarianceGood(row.varianceTotal);
          const varianceCellBg = good ? VARIANCE_BG_GOOD : VARIANCE_BG_BAD;
          const varianceTextClasses = good ? VARIANCE_TEXT_GOOD : VARIANCE_TEXT_BAD;
          const isGrayRow = GRAY_ROW_LABELS.has(row.label);
          const rowBg = isGrayRow
            ? " bg-slate-200 dark:bg-slate-700"
            : idx % 2 === 1
              ? " bg-slate-50/70 dark:bg-slate-800/30"
              : "";
          const labelCellCurtain = isGrayRow
            ? "!bg-slate-200 dark:!bg-slate-700 before:bg-slate-200 dark:before:bg-slate-700"
            : "!bg-slate-50 dark:!bg-slate-800 before:bg-slate-50 dark:before:bg-slate-800";
          const grayCell = "!bg-slate-200 dark:!bg-slate-700";
          const dataRow = (
            <tr key={row.label} className={rowBg}>
              <th
                className={`${STICKY_FIRST_COL} border-r-[2px] border-r-slate-400 font-semibold text-left dark:border-r-slate-500 ${labelCellCurtain}`}
              >
                {row.label}
              </th>
              <td className={`${TD_BASE} ${isGrayRow ? grayCell : ""}`}>
                {formatBudgetValue(row.budgetTotal)}
              </td>
              <td className={`${TD_BASE} ${isGrayRow ? grayCell : ""}`}>
                {formatBudgetValue(row.actualTotal)}
              </td>
              <td className={`${TD_BASE} ${varianceCellBg}${varianceTextClasses}`}>
                {formatBudgetValue(row.varianceTotal)}
              </td>
            </tr>
          );
          const beforeTotalStaff = row.label === "Total Staff Costs" ? [emptyRow("empty-before-Total Staff Costs")] : [];
          const beforeTotalBillable = row.label === "Total Billable" ? [emptyRow("empty-before-Total Billable")] : [];
          const afterGray = isGrayRow && row.label !== "Total Billable" ? [emptyRow(`empty-after-${row.label}`)] : [];
          return [...beforeTotalStaff, ...beforeTotalBillable, dataRow, ...afterGray];
        })}
      </tbody>
    </table>
  );
}
