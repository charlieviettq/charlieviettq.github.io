import Link from "next/link";
import {
  getCategoryLabel,
  getCategoryPillClasses,
  type PostMeta,
} from "@/lib/posts";

export function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-12 pt-8" style={{ borderTop: "1px solid var(--border-warm)" }}>
      <h2
        className="font-heading mb-4 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--foreground-secondary)" }}
      >
        Bài liên quan / Related posts
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}/`} className="group warm-card p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCategoryPillClasses(p.category)}`}
              >
                {getCategoryLabel(p.category)}
              </span>
              <span
                className="font-mono text-[10px] tabular-nums"
                style={{ color: "var(--foreground-secondary)" }}
              >
                {p.date}
              </span>
            </div>
            <p
              className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400"
              style={{ color: "var(--foreground)" }}
            >
              {p.title}
            </p>
            {p.excerpt && (
              <p
                className="mt-1 line-clamp-2 text-xs"
                style={{ color: "var(--foreground-secondary)" }}
              >
                {p.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
