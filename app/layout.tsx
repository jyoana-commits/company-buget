import type { ReactNode } from "react";
import "@/styles/globals.css";

export const metadata = {
  title: "Budget statistics",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

