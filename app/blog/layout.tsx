import type { ReactNode } from "react";
import Link from "next/link";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10">
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Blog
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Technical notes — credit risk, data, and engineering.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-zinc-200 bg-white/60 px-3 py-1.5 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:bg-zinc-900/55"
        >
          Home
        </Link>
      </div>
      {children}
    </main>
  );
}

