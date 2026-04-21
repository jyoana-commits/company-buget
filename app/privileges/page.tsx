import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import { ClientLink } from "@/components/ClientLink";
import { PrivilegeTable } from "./PrivilegeTable";

export const dynamic = "force-dynamic";

export default async function PrivilegesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? null;
  const user = getUserFromToken(token);

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/budget");
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { email: "asc" },
  });

  const userList = users.map((u) => ({
    id: String(u.id),
    name: u.name,
    email: u.email,
    role: u.role,
  }));

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <main className="mx-auto max-w-3xl">
        <header className="mb-10 flex w-full items-center justify-between">
          <ClientLink
            href="/budget"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            ← Budget Dashboard
          </ClientLink>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Privilege management
          </h1>
          <div className="w-[120px]" />
        </header>

        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Set user privileges: Admin, Manager, or Guest. Only admins can access this page.
        </p>

        <PrivilegeTable initialUsers={userList} />
      </main>
    </div>
  );
}
