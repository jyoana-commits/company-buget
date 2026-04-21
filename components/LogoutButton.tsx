"use client";

type Props = {
  className?: string;
};

export function LogoutButton({ className }: Props) {
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      window.location.href = "/auth/login";
    } catch {
      window.location.href = "/auth/login";
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ??
        "rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      }
    >
      Logout
    </button>
  );
}
