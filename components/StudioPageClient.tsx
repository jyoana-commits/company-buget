"use client";

import { useRouter } from "next/navigation";
import { BudgetTable } from "@/components/BudgetTable";
import { StudioPageHeader } from "@/components/StudioPageHeader";
import { SummaryContent } from "@/components/SummaryContent";
import type { SummaryRow, MonthlyTotal } from "@/lib/budgetSummary";

type Props = {
  studio: string;
  studioName: string;
  rawRows: string[][];
  summaryRows: SummaryRow[];
  monthlyTotals: MonthlyTotal[];
  totalVariance: number;
  updatedAt: string | null;
  view: "complete" | "summary";
};

export function StudioPageClient({
  studio,
  studioName,
  rawRows,
  summaryRows,
  monthlyTotals,
  totalVariance,
  updatedAt,
  view,
}: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-50 px-3 pt-3 pb-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto w-full max-w-[100%]">
        <StudioPageHeader
          studio={studio}
          studioName={studioName}
          updatedAt={updatedAt}
          activeTab={view}
          onUploadSuccess={() => router.refresh()}
        />
        <div className="max-h-[calc(100vh-7.5rem)] overflow-auto">
          {view === "complete" ? (
            <div className="rounded-xl border-2 border-slate-200 bg-white shadow-md ring-1 ring-slate-100 dark:border-slate-600 dark:bg-zinc-900 dark:ring-slate-500/20">
              {rawRows.length > 0 ? (
                <div className="overflow-x-auto pl-0 pr-1 pt-1 pb-1">
                  <BudgetTable rawRows={rawRows} />
                </div>
              ) : (
                <p className="p-5 text-zinc-600 dark:text-zinc-400">
                  Complete budget view — data not available.
                </p>
              )}
            </div>
          ) : (
            <div className="pb-4">
              <SummaryContent
                summaryRows={summaryRows}
                monthlyTotals={monthlyTotals}
                totalVariance={totalVariance}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
