"use client";

import { useState } from "react";
import type { UserRole } from "@/utils/auth";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const ROLES: UserRole[] = ["ADMIN", "MANAGER", "GUEST"];

export function PrivilegeTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setError("");
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = (await res.json()) as { message?: string; user?: UserRow };
      if (!res.ok) {
        setError(data.message ?? "Failed to update role");
        return;
      }
      if (data.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: data.user!.role } : u))
        );
      }
    } catch {
      setError("Network error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {error && (
        <div className="border-b border-zinc-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-zinc-700 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
            <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
              Name
            </th>
            <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
              Email
            </th>
            <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-zinc-100 last:border-0 dark:border-zinc-700/50"
            >
              <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                {user.name}
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {user.email}
              </td>
              <td className="px-4 py-3">
                <select
                  value={user.role}
                  disabled={updatingId === user.id}
                  onChange={(e) =>
                    handleRoleChange(user.id, e.target.value as UserRole)
                  }
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-zinc-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-emerald-500"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {updatingId === user.id && (
                  <span className="ml-2 text-xs text-zinc-500">Saving...</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
