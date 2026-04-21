"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only after client mount to avoid hydration mismatches
 * (e.g. from browser extensions or server/client attribute differences).
 * Server and initial client render show a matching shell to avoid layout shift.
 */
export function HydrationGuard({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="min-h-screen bg-slate-950 text-slate-50"
        aria-hidden
        suppressHydrationWarning
      />
    );
  }

  return <>{children}</>;
}
