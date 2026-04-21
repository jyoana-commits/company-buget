"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Link that renders a plain <a> and uses client-side navigation.
 * Avoids hydration mismatches from Next.js Link adding different attributes on the client.
 */
type Props = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function ClientLink({ href, className, children }: Props) {
  const router = useRouter();

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        router.push(href);
      }}
    >
      {children}
    </a>
  );
}
