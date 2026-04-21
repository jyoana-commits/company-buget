import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/utils/auth";
import { STUDIOS } from "@/lib/budget";
import {
  buildBudgetSummary,
  buildMonthlyTotals,
  getBudgetFileModifiedAt,
  type SummaryRow,
} from "@/lib/budgetSummary";
import { MONTHS } from "@/lib/budgetGrid";
import { loadBudgetFromXlsx } from "@/lib/excel";
import { formatDateTimeForDisplay } from "@/lib/formatDate";
import { formatBudgetValue } from "@/lib/formatBudget";
import { ClientLink } from "@/components/ClientLink";
import { SummaryTable } from "@/components/SummaryTable";

type PageProps = {};

export const dynamic = "force-dynamic";

export default async function CombinedSummaryPage({}: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? null;
  const user = getUserFromToken(token);
  if (!user) {
    redirect("/auth/login");
  }
  if (user.role === "GUEST") {
    redirect("/budget");
  }

  const allRows: SummaryRow[] = [];
  const labelOrder: string[] = [];
  const combinedRows = new Map<string, SummaryRow>();
  const monthlyTotals = MONTHS.map((_, monthIndex) => ({
    monthIndex,
    budget: 0,
    actual: 0,
  }));

  for (const studio of STUDIOS) {
    const rawRows = await loadBudgetFromXlsx(studio.name);
    if (!rawRows.length) continue;

    const summary = buildBudgetSummary(rawRows);
    const monthly = buildMonthlyTotals(rawRows);

    summary.rows.forEach((row) => {
      const existing = combinedRows.get(row.label);
      if (!existing) {
        combinedRows.set(row.label, {
          label: row.label,
          budgetTotal: row.budgetTotal,
          actualTotal: row.actualTotal,
          varianceTotal: row.varianceTotal,
        });
        labelOrder.push(row.label);
      } else {
        existing.budgetTotal += row.budgetTotal;
        existing.actualTotal += row.actualTotal;
        existing.varianceTotal = existing.budgetTotal - existing.actualTotal;
      }
    });

    monthly.forEach((m, index) => {
      monthlyTotals[index].budget += m.budget;
      monthlyTotals[index].actual += m.actual;
    });
  }

  labelOrder.forEach((label) => {
    const row = combinedRows.get(label);
    if (row) allRows.push(row);
  });

  const totalVariance = allRows.reduce(
    (sum, row) => sum + row.varianceTotal,
    0
  );

  const updatedAtList = (
    await Promise.all(STUDIOS.map((s) => getBudgetFileModifiedAt(s.name)))
  ).filter((d): d is Date => !!d);
  const latestUpdated =
    updatedAtList.length > 0
      ? new Date(Math.max(...updatedAtList.map((d) => d.getTime())))
      : null;
  const updatedAt = latestUpdated ? formatDateTimeForDisplay(latestUpdated) : null;

  const hasData = allRows.length > 0;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto w-full max-w-5xl">
        <nav className="mb-8 flex items-center gap-4">
          <ClientLink
            href="/budget"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            ← Budget Dashboard
          </ClientLink>
        </nav>
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          SUMMARY — COMBINED
        </h1>
        <p className="mb-4 text-zinc-600 dark:text-zinc-400">
          Combined year-to-date summary across all studios.
        </p>
        <div
          className="mb-6 text-xs text-zinc-500 dark:text-zinc-400"
          suppressHydrationWarning
        >
          Last file update (any studio): {updatedAt ?? "—"}
        </div>

        {hasData ? (
          <section className="space-y-4">
            <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-md ring-1 ring-slate-100 dark:border-slate-600 dark:bg-zinc-900 dark:ring-slate-500/20">
              <h2 className="border-b-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-800 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100">
                Year-to-date totals (Budget vs Actual vs Variance)
              </h2>
              <div className="overflow-x-auto p-1">
                <SummaryTable summaryRows={allRows} />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-md ring-1 ring-slate-100 dark:border-slate-600 dark:bg-zinc-900 dark:ring-slate-500/20">
              <h2 className="border-b-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-800 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100">
                Monthly budget vs actual (all studios)
              </h2>
              <p className="border-b border-slate-200 px-4 pb-3 text-xs text-zinc-600 dark:border-slate-600 dark:text-zinc-400">
                Total variance YTD:{" "}
                <span
                  className={`font-semibold ${
                    totalVariance >= 0
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {formatBudgetValue(totalVariance)}
                </span>
              </p>
              <div className="flex items-end gap-5 overflow-x-auto p-4">
                {monthlyTotals.map((m) => {
                  const maxValue = Math.max(
                    ...monthlyTotals.map((x) => Math.max(x.budget, x.actual)),
                    1
                  );
                  const maxBarHeight = 160;
                  const monthName = MONTHS[m.monthIndex];
                  const showActual = m.actual > 0;
                  const budgetHeight =
                    (m.budget / maxValue) * maxBarHeight || 2;
                  const actualHeight =
                    (m.actual / maxValue) * maxBarHeight || 0;
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
                          title={`Budget ${monthName}: ${formatBudgetValue(
                            m.budget
                          )}`}
                        />
                        <div
                          className="w-3.5 rounded-t bg-orange-400 shadow-sm"
                          style={{
                            height: `${showActual ? Math.max(4, actualHeight) : 0}px`,
                          }}
                          title={
                            showActual
                              ? `Actual ${monthName}: ${formatBudgetValue(
                                  m.actual
                                )}`
                              : `Actual ${monthName}: n/a`
                          }
                        />
                      </div>
                      <span className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {monthName.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-md dark:border-slate-600 dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">
              Combined summary — data not available yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

