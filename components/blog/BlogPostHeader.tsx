import Link from "next/link";

import { getCategoryLabel, getCategoryPillClasses } from "@/lib/category";
import { formatReadTime } from "@/lib/read-time";
import type { PostFrontMatter } from "@/lib/posts";

type Props = {
  slug: string;
  frontMatter: PostFrontMatter;
  lang: "vi" | "en";
  readTimeMinutes: number;
};

export function BlogPostHeader({
  slug,
  frontMatter,
  lang,
  readTimeMinutes,
}: Props) {
  const category = frontMatter.category ?? "banking";

  return (
    <header className="mb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-warm)] pb-4">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm"
          style={{ color: "var(--foreground-secondary)" }}
        >
          <Link
            href="/blog/"
            className="font-medium transition-colors hover:text-amber-600 dark:hover:text-amber-400"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Blog
          </Link>
          <span aria-hidden="true">/</span>
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide ${getCategoryPillClasses(category)}`}
          >
            {getCategoryLabel(category)}
          </span>
        </nav>

        <div
          className="flex items-center gap-1 rounded-xl border border-[var(--border-warm)] bg-surface-100/80 p-1 shadow-sm backdrop-blur dark:bg-surface-300/40"
        >
          {lang === "vi" ? (
            <span className="rounded-lg bg-amber-500/12 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
              VI
            </span>
          ) : (
            <Link
              href={`/blog/${slug}/`}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold transition hover:bg-surface-300/50"
              style={{ color: "var(--foreground-secondary)" }}
            >
              VI
            </Link>
          )}
          <span
            className="h-5 w-px"
            style={{ backgroundColor: "var(--border-warm-md)" }}
          />
          {lang === "en" ? (
            <span className="rounded-lg bg-amber-500/12 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
              EN
            </span>
          ) : (
            <Link
              href={`/blog/${slug}/en/`}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold transition hover:bg-surface-300/50"
              style={{ color: "var(--foreground-secondary)" }}
            >
              EN
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-medium">
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 font-semibold tracking-wide ${getCategoryPillClasses(category)}`}
        >
          {getCategoryLabel(category)}
        </span>
        <time
          className="font-mono tabular-nums"
          style={{ color: "var(--foreground-secondary)" }}
        >
          {frontMatter.date}
        </time>
        <span style={{ color: "var(--foreground-secondary)" }} aria-hidden="true">
          ·
        </span>
        <span style={{ color: "var(--foreground-secondary)" }}>
          {formatReadTime(readTimeMinutes, lang)}
        </span>
      </div>

      <h1
        className="mt-4 font-heading text-4xl font-bold tracking-tight"
        style={{ color: "var(--foreground)" }}
      >
        {frontMatter.title}
      </h1>

      {frontMatter.excerpt ? (
        <p
          className="mt-4 max-w-2xl text-lg leading-relaxed"
          style={{ color: "var(--foreground-secondary)" }}
        >
          {frontMatter.excerpt}
        </p>
      ) : null}

      <div
        className="mt-8 border-b border-[var(--border-warm)]"
        aria-hidden="true"
      />
    </header>
  );
}
