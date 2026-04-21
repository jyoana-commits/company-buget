/**
 * Shared header for studio Complete and Summary pages.
 * Fixed 4-column grid so positions do not shift when navigating between pages.
 */
import { ClientLink } from "@/components/ClientLink";
import { UploadBudgets } from "@/components/UploadBudgets";

type Props = {
  studio: string;
  studioName: string;
  updatedAt: string | null;
  activeTab: "complete" | "summary";
  onUploadSuccess: () => void;
};

export function StudioPageHeader({
  studio,
  studioName,
  updatedAt,
  activeTab,
  onUploadSuccess,
}: Props) {
  return (
    <header className="mb-6 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
      {/* Fixed grid: same column widths on both pages so nothing shifts */}
      <div className="grid w-full grid-cols-[minmax(0,10rem)_minmax(0,1fr)_12rem_minmax(0,22rem)] items-center gap-3">
        <div className="min-w-0">
          <ClientLink
            href="/budget"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 whitespace-nowrap"
          >
            ← Budget Dashboard
          </ClientLink>
        </div>
        <div className="min-w-0 text-center text-lg font-bold text-zinc-900 dark:text-zinc-100 sm:text-xl">
          {studioName}
        </div>
        <div className="min-w-0">
          <div className="grid w-full grid-cols-2 rounded-full border border-zinc-200 bg-zinc-100 p-0.5 text-[11px] sm:text-xs dark:border-zinc-700 dark:bg-zinc-800">
            <ClientLink
              href={`/budget/${studio}`}
              className={
                activeTab === "complete"
                  ? "rounded-full bg-white py-1 text-center font-semibold text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "rounded-full py-1 text-center font-medium text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }
            >
              Complete
            </ClientLink>
            <ClientLink
              href={`/budget/${studio}?view=summary`}
              className={
                activeTab === "summary"
                  ? "rounded-full bg-white py-1 text-center font-semibold text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "rounded-full py-1 text-center font-medium text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }
            >
              Summary
            </ClientLink>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-3">
          <span
            className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400"
            suppressHydrationWarning
          >
            Last update: {updatedAt ?? "—"}
          </span>
          <UploadBudgets onUploadSuccess={onUploadSuccess} />
        </div>
      </div>
    </header>
  );
}
