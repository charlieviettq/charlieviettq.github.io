import type { ReactNode } from "react";
import Link from "next/link";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <h1
            className="font-heading text-2xl font-semibold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Blog
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Technical notes — credit risk, data, and engineering.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-[var(--border-warm)] bg-surface-100/80 px-3 py-1.5 text-sm font-semibold shadow-sm backdrop-blur transition hover:bg-surface-300/50 dark:bg-surface-300/40"
          style={{ color: "var(--foreground)" }}
        >
          Home
        </Link>
      </div>
      {children}
    </main>
  );
}
