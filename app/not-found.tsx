import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-mono text-6xl font-bold text-amber-400">404</p>
      <h1 className="font-heading text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Page not found
      </h1>
      <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        This page may have been moved, or the URL is incorrect.
      </p>
      <Link
        href="/blog/"
        className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-500"
      >
        Browse all posts
      </Link>
    </main>
  );
}
