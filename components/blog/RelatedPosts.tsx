import Link from "next/link";
import {
  getCategoryLabel,
  getCategoryPillClasses,
  type PostMeta,
} from "@/lib/posts";

export function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-12 border-t border-zinc-200/60 pt-8 dark:border-zinc-700/40">
      <h2 className="font-heading mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Bài liên quan / Related posts
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}/`}
            className="group rounded-lg border border-zinc-200/60 bg-white/80 p-4 transition hover:border-amber-300/60 hover:shadow-sm dark:border-zinc-700/40 dark:bg-zinc-900/60"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCategoryPillClasses(p.category)}`}
              >
                {getCategoryLabel(p.category)}
              </span>
              <span className="font-mono text-[10px] tabular-nums text-zinc-400">
                {p.date}
              </span>
            </div>
            <p className="line-clamp-2 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-amber-600 dark:text-zinc-100 dark:group-hover:text-amber-400">
              {p.title}
            </p>
            {p.excerpt && (
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                {p.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
