import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/utils/auth";
import { STUDIOS, COMBINED_SLUG } from "@/lib/budget";
import { ClientLink } from "@/components/ClientLink";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? null;
  const user = getUserFromToken(token);
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <main className="mx-auto flex max-w-3xl flex-col items-center">
        <header className="mb-20 flex w-full items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10">
              <span className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
                $
              </span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Budget Dashboard
            </h1>
          </div>
          <div className="flex flex-1" />
          <div className="flex items-center gap-2">
            {user.role !== "GUEST" && (
              <ClientLink
                href="/privileges"
                className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 transition-colors hover:border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/30"
              >
                Privilege manage
              </ClientLink>
            )}
            <LogoutButton />
          </div>
        </header>

        <section className="mb-16 w-full max-w-2xl text-center">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Studios
          </h2>
          <div className="grid justify-center gap-3 sm:grid-cols-3">
            {STUDIOS.map((studio) =>
              user.role === "GUEST" ? (
                <div
                  key={studio.slug}
                  className="flex cursor-not-allowed items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-4 text-sm font-semibold text-zinc-400 opacity-70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
                  aria-disabled="true"
                >
                  {studio.name}
                </div>
              ) : (
                <ClientLink
                  key={studio.slug}
                  href={`/budget/${studio.slug}`}
                  className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  {studio.name}
                </ClientLink>
              )
            )}
          </div>
        </section>

        <section className="w-full max-w-xs text-center">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Company total
          </h2>
          {user.role === "GUEST" ? (
            <div
              className="flex cursor-not-allowed items-center justify-center rounded-xl border-2 border-emerald-600/50 bg-emerald-50/70 px-6 py-4 text-sm font-semibold text-emerald-800/70 dark:border-emerald-500/50 dark:bg-emerald-950/30 dark:text-emerald-200/70"
              aria-disabled="true"
            >
              COMBINED
            </div>
          ) : (
            <ClientLink
              href={`/budget/${COMBINED_SLUG}/summary`}
              className="flex items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-50 px-6 py-4 text-sm font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
            >
              COMBINED
            </ClientLink>
          )}
        </section>
      </main>
    </div>
  );
}

