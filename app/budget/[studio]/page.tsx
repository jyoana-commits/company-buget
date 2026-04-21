import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/utils/auth";
import {
  getStudioBySlug,
  isCombined,
  isValidStudioSlug,
} from "@/lib/budget";
import {
  buildBudgetSummary,
  buildMonthlyTotals,
  getBudgetFileModifiedAt,
} from "@/lib/budgetSummary";
import { loadBudgetFromXlsx } from "@/lib/excel";
import { formatDateTimeForDisplay } from "@/lib/formatDate";
import { StudioPageClient } from "@/components/StudioPageClient";

type PageProps = {
  params: Promise<{ studio: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const dynamic = "force-dynamic";

export default async function StudioPage({ params, searchParams }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? null;
  const user = getUserFromToken(token);
  if (!user) {
    redirect("/auth/login");
  }
  if (user.role === "GUEST") {
    redirect("/budget");
  }

  const { studio: studioParam } = await params;
  const studio = studioParam ?? "";
  if (!isValidStudioSlug(studio) || isCombined(studio)) {
    notFound();
  }

  const studioInfo = getStudioBySlug(studio);
  if (!studioInfo) {
    notFound();
  }

  const rawRows = await loadBudgetFromXlsx(studioInfo.name);
  const summary = buildBudgetSummary(rawRows);
  const monthlyTotals = buildMonthlyTotals(rawRows);
  const totalVariance = summary.rows.reduce(
    (sum, row) => sum + row.varianceTotal,
    0
  );
  const updated = await getBudgetFileModifiedAt(studioInfo.name);

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const viewParam = resolvedSearchParams?.view;
  const view =
    viewParam === "summary" || (Array.isArray(viewParam) && viewParam[0] === "summary")
      ? "summary"
      : "complete";

  const updatedAt = updated ? formatDateTimeForDisplay(updated) : null;

  return (
    <StudioPageClient
      studio={studio}
      studioName={studioInfo.name}
      rawRows={rawRows}
      summaryRows={summary.rows}
      monthlyTotals={monthlyTotals}
      totalVariance={totalVariance}
      updatedAt={updatedAt}
      view={view}
    />
  );
}

