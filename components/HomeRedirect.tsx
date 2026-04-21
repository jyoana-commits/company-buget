"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client-side redirect. Used by the home page so the server does not call
 * redirect(), which can cause Next.js performance.measure to throw
 * "cannot have a negative time stamp".
 */
export function HomeRedirect({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return (
    <div className="min-h-screen bg-slate-950" aria-label="Redirecting">
      {/* Minimal placeholder while redirect runs; matches layout background */}
    </div>
  );
}
