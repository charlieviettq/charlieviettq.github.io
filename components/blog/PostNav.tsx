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
      className="mt-12 flex gap-4 pt-6"
      style={{ borderTop: "1px solid var(--border-warm)" }}
      aria-label="Post navigation"
    >
      {prev && (
        <Link href={`/blog/${prev.slug}/`} className="group warm-card flex-1 p-4">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--foreground-secondary)" }}
          >
            ← Older
          </p>
          <p
            className="mt-1.5 line-clamp-2 text-sm font-medium transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400"
            style={{ color: "var(--foreground)" }}
          >
            {prev.title}
          </p>
        </Link>
      )}
      {next && (
        <Link href={`/blog/${next.slug}/`} className="group warm-card flex-1 p-4 text-right">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Newer →
          </p>
          <p
            className="mt-1.5 line-clamp-2 text-sm font-medium transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400"
            style={{ color: "var(--foreground)" }}
          >
            {next.title}
          </p>
        </Link>
      )}
    </nav>
  );
}
