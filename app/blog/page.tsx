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

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div>
        <h1
          className="font-heading text-3xl font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Blog
        </h1>
        <p
          className="mt-2 max-w-2xl text-base leading-relaxed"
          style={{ color: "var(--foreground-secondary)" }}
        >
          Ghi chép kỹ thuật — song ngữ VI/EN. Bốn chủ đề:
          Data Science, Data Engineering, Gen AI, Banking Domain.
        </p>

        {/* BeGuru featured link */}
        <p className="mt-3 max-w-2xl text-sm" style={{ color: "var(--foreground-secondary)" }}>
          <strong style={{ color: "var(--foreground)" }}>BeGuru / Gen AI:</strong>{" "}
          <Link
            href="/blog/beguru-ai-architecture-overview"
            style={{ color: "var(--brand-from)" }}
            className="underline decoration-current/30 underline-offset-2 hover:opacity-80 transition"
          >
            Technical Docs — kiến trúc tổng quan
          </Link>
          {" "}(runtime, disk artifacts, memory).
        </p>

        <p className="mt-2 text-sm" style={{ color: "var(--foreground-secondary)" }}>
          <strong style={{ color: "var(--foreground)" }}>Tìm bài:</strong> ⌘K / Ctrl+K
        </p>

        {/* Category jump nav */}
        <nav className="mt-4 flex flex-wrap gap-2" aria-label="Jump to category">
          {BLOG_CATEGORY_ORDER.map((cat) => (
            <a
              key={cat}
              href={`#${cat}`}
              className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-bold tracking-wide transition hover:opacity-90 ${getCategoryPillClasses(cat)}`}
            >
              {getCategoryLabel(cat)}
            </a>
          ))}
        </nav>
      </div>

      {/* ── Category sections ─────────────────────────────────────────────────── */}
      {BLOG_CATEGORY_ORDER.map((cat) => {
        const posts = getPostsByCategory(cat);
        return (
          <section key={cat} id={cat} className="scroll-mt-24">
            <GradientCard className="space-y-0 overflow-hidden !p-0">

              {/* Section header */}
              <header
                className="flex items-center gap-4 px-6 py-5"
                style={{ borderBottom: "1px solid var(--border-warm)" }}
              >
                {/* Colour accent bar matching the category */}
                <span
                  className={`h-10 w-1 shrink-0 rounded-full ${getCategoryPillClasses(cat).split(" ")[0]}`}
                />
                <div>
                  <h2
                    className="font-heading text-xl font-bold tracking-tight"
                    style={{ color: "var(--foreground)" }}
                  >
                    {getCategoryLabel(cat)}
                  </h2>
                  <p className="mt-0.5 text-sm" style={{ color: "var(--foreground-secondary)" }}>
                    {getCategorySubtitleVi(cat)}
                  </p>
                </div>
              </header>

              {/* Post list */}
              {posts.length === 0 ? (
                <p className="px-6 py-5 text-sm" style={{ color: "var(--foreground-secondary)" }}>
                  No posts yet.
                </p>
              ) : (
                <ul className="divide-y" style={{ borderColor: "var(--border-warm)" }}>
                  {posts.map((post) => (
                    <li key={post.slug} className="post-item relative">

                      {/* Orange left accent — appears on hover via CSS */}
                      <span
                        className="post-accent absolute left-0 top-0 h-full w-[3px]"
                        style={{ backgroundColor: "var(--brand-from)" }}
                      />

                      <div className="px-6 py-5">
                        {/* Category pill + date — pill is prominent */}
                        <div className="mb-3 flex flex-wrap items-center gap-2.5">
                          <span
                            className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wide ${getCategoryPillClasses(post.category)}`}
                          >
                            {getCategoryLabel(post.category)}
                          </span>
                          <span
                            className="font-mono text-xs tabular-nums"
                            style={{ color: "var(--foreground-secondary)" }}
                          >
                            {post.date}
                          </span>
                        </div>

                        {/* Title — large, bold, brand-color on hover via CSS */}
                        <h3 className="font-heading text-xl font-bold leading-snug">
                          <Link
                            href={`/blog/${post.slug}/`}
                            className="post-title-link"
                          >
                            {post.title}
                          </Link>
                        </h3>

                        {/* Excerpt */}
                        {post.excerpt && (
                          <p
                            className="mt-1.5 line-clamp-2 text-sm leading-relaxed"
                            style={{ color: "var(--foreground-secondary)" }}
                          >
                            {post.excerpt}
                          </p>
                        )}
                      </div>
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
