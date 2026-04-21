/**
 * Summary view content: YTD totals table + monthly budget vs actual chart.
 * Used inside the single studio page when toggle is "Summary".
 */
import { MONTHS } from "@/lib/budgetGrid";
import { formatBudgetValue } from "@/lib/formatBudget";
import type { SummaryRow } from "@/lib/budgetSummary";
import { SummaryTable } from "@/components/SummaryTable";

export type { SummaryRow } from "@/lib/budgetSummary";

type Props = {
  summaryRows: SummaryRow[];
  monthlyTotals: { monthIndex: number; budget: number; actual: number }[];
  totalVariance: number;
};

export function SummaryContent({
  summaryRows,
  monthlyTotals,
  totalVariance,
}: Props) {
  if (summaryRows.length === 0) {
    return (
      <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-md dark:border-slate-600 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">
          Summary view — data not available yet for this studio.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-md ring-1 ring-slate-100 dark:border-slate-600 dark:bg-zinc-900 dark:ring-slate-500/20">
        <h2 className="border-b-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-800 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100">
          Year-to-date totals (Budget vs Actual vs Variance)
        </h2>
        <div className="overflow-x-auto p-1">
          <SummaryTable summaryRows={summaryRows} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-md ring-1 ring-slate-100 dark:border-slate-600 dark:bg-zinc-900 dark:ring-slate-500/20">
        <h2 className="border-b-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-800 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100">
          Monthly budget vs actual
        </h2>
        <p className="border-b border-slate-200 px-4 pb-3 text-xs text-zinc-600 dark:border-slate-600 dark:text-zinc-400">
          Total variance YTD:{" "}
          <span
            className={`font-semibold ${totalVariance >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
          >
            {formatBudgetValue(totalVariance)}
          </span>
        </p>
        <div className="flex items-end gap-5 overflow-x-auto p-4">
          {(() => {
            const maxValue = Math.max(
              ...monthlyTotals.map((m) => Math.max(m.budget, m.actual)),
              1
            );
            const maxBarHeight = 160;
            return monthlyTotals.map((m) => {
              const monthName = MONTHS[m.monthIndex];
              const showActual = m.actual > 0;
              const budgetHeight = (m.budget / maxValue) * maxBarHeight || 2;
              const actualHeight = (m.actual / maxValue) * maxBarHeight || 0;
              return (
                <div
                  key={monthName}
                  className="flex flex-col items-center justify-end gap-1.5 rounded-lg border-2 border-slate-200 bg-slate-50/80 px-3 py-3 dark:border-slate-600 dark:bg-slate-800/50"
                  style={{ minWidth: 48 }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="tabular-nums text-[10px] font-medium text-slate-700 dark:text-slate-300">
                      {m.budget !== 0 ? formatBudgetValue(m.budget) : ""}
                    </span>
                    {showActual && (
                      <span className="tabular-nums text-[10px] font-medium text-orange-600 dark:text-orange-400">
                        {formatBudgetValue(m.actual)}
                      </span>
                    )}
                  </div>
                  <div className="flex h-[160px] w-9 items-end justify-center gap-1">
                    <div
                      className="w-4 rounded-t bg-blue-500 shadow-sm"
                      style={{
                        height: `${m.budget > 0 ? Math.max(4, budgetHeight) : 0}px`,
                      }}
                      title={`Budget ${monthName}: ${formatBudgetValue(m.budget)}`}
                    />
                    <div
                      className="w-3.5 rounded-t bg-orange-400 shadow-sm"
                      style={{
                        height: `${showActual ? Math.max(4, actualHeight) : 0}px`,
                      }}
                      title={
                        showActual
                          ? `Actual ${monthName}: ${formatBudgetValue(m.actual)}`
                          : `Actual ${monthName}: n/a`
                      }
                    />
                  </div>
                  <span className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {monthName.slice(0, 3)}
                  </span>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </section>
  );
}
