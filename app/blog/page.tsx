import Link from "next/link";

import { getCategoryLabel, getCategoryPillClasses } from "@/lib/category";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "error";

export default function BlogIndexPage() {
  const posts = getAllPosts().filter(
    (p) => (p.frontMatter.visibility ?? "public") === "public",
  );

  return (
    <section className="space-y-1">
      {posts.length === 0 ? (
        <div
          className="rounded-2xl border border-[var(--border-warm)] bg-surface-100/80 p-6 text-sm shadow-sm backdrop-blur dark:bg-surface-300/40"
          style={{ color: "var(--foreground-secondary)" }}
        >
          No posts yet. Add markdown files under <code>content/posts/</code>.
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border-warm)] rounded-2xl border border-[var(--border-warm)] bg-surface-100/60 shadow-sm backdrop-blur dark:bg-surface-300/30">
          {posts.map((p) => {
            const category = p.frontMatter.category ?? "banking";
            return (
              <li key={p.slug} className="post-item relative px-5 py-4">
                <span
                  className="post-accent absolute inset-y-3 left-0 w-0.5 rounded-full bg-amber-500/70"
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ${getCategoryPillClasses(category)}`}
                      >
                        {getCategoryLabel(category)}
                      </span>
                      <time className="post-date-col">{p.frontMatter.date}</time>
                    </div>
                    <Link
                      href={`/blog/${p.slug}/`}
                      className="post-title-link group inline-flex items-center gap-2 text-base font-semibold"
                    >
                      <span>{p.frontMatter.title}</span>
                      <span
                        className="post-arrow text-amber-600 dark:text-amber-400"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </Link>
                    {p.frontMatter.excerpt ? (
                      <p
                        className="mt-2 line-clamp-2 text-sm leading-relaxed"
                        style={{ color: "var(--foreground-secondary)" }}
                      >
                        {p.frontMatter.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                      <Link
                        href={`/blog/${p.slug}/`}
                        className="rounded-md border border-[var(--border-warm)] bg-surface-100/80 px-2 py-1 shadow-sm transition hover:bg-surface-300/50 dark:bg-surface-300/40"
                        style={{ color: "var(--foreground-secondary)" }}
                      >
                        VI
                      </Link>
                      <Link
                        href={`/blog/${p.slug}/en/`}
                        className="rounded-md border border-[var(--border-warm)] bg-surface-100/80 px-2 py-1 shadow-sm transition hover:bg-surface-300/50 dark:bg-surface-300/40"
                        style={{ color: "var(--foreground-secondary)" }}
                      >
                        EN
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
