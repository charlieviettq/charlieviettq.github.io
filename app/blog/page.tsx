import Link from "next/link";

import { getAllPosts } from "@/lib/posts";

export const dynamic = "error";

export default function BlogIndexPage() {
  const posts = getAllPosts().filter(
    (p) => (p.frontMatter.visibility ?? "public") === "public",
  );

  return (
    <section className="space-y-4">
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white/60 p-6 text-sm text-zinc-700 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-200">
          No posts yet. Add markdown files under <code>content/posts/</code>.
        </div>
      ) : (
        <ul className="grid gap-4">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}/`}
                className="block rounded-2xl border border-zinc-200 bg-white/60 p-5 shadow-sm backdrop-blur transition hover:bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/55"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {p.frontMatter.title}
                  </h2>
                  <time className="shrink-0 text-xs text-zinc-600 dark:text-zinc-400">
                    {p.frontMatter.date}
                  </time>
                </div>
                {p.frontMatter.excerpt ? (
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {p.frontMatter.excerpt}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

