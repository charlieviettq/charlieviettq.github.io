import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export function PostNav({
  prev,
  next,
}: {
  prev: PostMeta | null;
  next: PostMeta | null;
}) {
  if (!prev && !next) return null;
  return (
    <nav
      className="mt-12 flex gap-4 border-t border-zinc-200/60 pt-6 dark:border-zinc-700/40"
      aria-label="Post navigation"
    >
      {prev && (
        <Link
          href={`/blog/${prev.slug}/`}
          className="group flex-1 rounded-lg border border-zinc-200/60 bg-white/80 p-4 transition hover:border-amber-300/60 hover:shadow-sm dark:border-zinc-700/40 dark:bg-zinc-900/60"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            ← Older
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-zinc-900 transition-colors group-hover:text-amber-600 dark:text-zinc-100 dark:group-hover:text-amber-400">
            {prev.title}
          </p>
        </Link>
      )}
      {next && (
        <Link
          href={`/blog/${next.slug}/`}
          className="group flex-1 rounded-lg border border-zinc-200/60 bg-white/80 p-4 text-right transition hover:border-amber-300/60 hover:shadow-sm dark:border-zinc-700/40 dark:bg-zinc-900/60"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Newer →
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-medium text-zinc-900 transition-colors group-hover:text-amber-600 dark:text-zinc-100 dark:group-hover:text-amber-400">
            {next.title}
          </p>
        </Link>
      )}
    </nav>
  );
}
