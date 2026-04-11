import type { Metadata } from "next";
import Link from "next/link";
import { GradientCard } from "@/components/GradientCard";
import {
  BLOG_CATEGORY_ORDER,
  getCategoryLabel,
  getCategoryPillClasses,
  getCategorySubtitleVi,
  getPostsByCategory,
} from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Short technical notes grouped by Data Science, Data Engineering, Gen AI, and Banking Domain — bilingual VI/EN where helpful.",
};

export default function BlogIndexPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Notes / Ghi chép ngắn — song ngữ trong bài khi phù hợp. Bốn chuyên mục:
          Data Science, Data Engineering, Gen AI, Banking Domain.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          <strong className="font-medium text-zinc-700 dark:text-zinc-300">
            BeGuru / Gen AI:
          </strong>{" "}
          <Link
            href="/blog/beguru-ai-architecture-overview"
            className="text-sky-700 underline decoration-sky-500/40 underline-offset-2 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Technical Docs (kiến trúc tổng quan)
          </Link>
          {" — "}
          <span className="text-zinc-500 dark:text-zinc-400">
            architecture overview (runtime, disk artifacts, memory).
          </span>
        </p>
        <p className="mt-3 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          <strong className="font-medium text-zinc-600 dark:text-zinc-300">Tìm bài:</strong> dùng nút{" "}
          <span className="whitespace-nowrap rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-800">
            Tìm kiếm
          </span>{" "}
          trên thanh điều hướng hoặc phím tắt ⌘K / Ctrl+K.
        </p>
        <nav
          className="mt-4 flex flex-wrap gap-2 text-sm"
          aria-label="Jump to category"
        >
          {BLOG_CATEGORY_ORDER.map((cat) => (
            <a
              key={cat}
              href={`#${cat}`}
              className={`inline-flex items-center rounded-full px-3 py-1 font-medium transition hover:opacity-90 ${getCategoryPillClasses(cat)}`}
            >
              {getCategoryLabel(cat)}
            </a>
          ))}
        </nav>
      </div>

      {BLOG_CATEGORY_ORDER.map((cat) => {
        const posts = getPostsByCategory(cat);
        return (
          <section key={cat} id={cat} className="scroll-mt-24">
            <GradientCard className="space-y-4">
              <header className="border-b border-sky-200/50 pb-4 dark:border-sky-500/20">
                <h2 className="text-xl font-bold tracking-tight">
                  {getCategoryLabel(cat)}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {getCategorySubtitleVi(cat)}
                </p>
              </header>
              {posts.length === 0 ? (
                <p className="text-sm text-zinc-500">No posts in this category yet.</p>
              ) : (
                <ul className="space-y-5">
                  {posts.map((post) => (
                    <li
                      key={post.slug}
                      className="border-b border-zinc-200/80 pb-5 last:border-0 last:pb-0 dark:border-zinc-700/80"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                          {post.date}
                        </p>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getCategoryPillClasses(post.category)}`}
                        >
                          {getCategoryLabel(post.category)}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold">
                        <Link
                          href={`/blog/${post.slug}/`}
                          className="text-zinc-900 hover:text-sky-600 dark:text-zinc-100 dark:hover:text-sky-400"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </GradientCard>
          </section>
        );
      })}
    </div>
  );
}
