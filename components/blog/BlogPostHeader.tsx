import Link from "next/link";

import { getCategoryLabel, getCategoryPillClasses } from "@/lib/category";
import { formatReadTime } from "@/lib/read-time";
import type { PostFrontMatter } from "@/lib/posts";

type Props = {
  slug: string;
  frontMatter: PostFrontMatter;
  lang: "vi" | "en";
  readTimeMinutes: number;
  seriesName?: string;
};

export function BlogPostHeader({
  slug,
  frontMatter,
  lang,
  readTimeMinutes,
  seriesName,
}: Props) {
  const category = frontMatter.category ?? "banking";

  return (
    <header className="blog-post-header">
      <div className="blog-post-kicker">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2"
        >
          <Link
            href="/blog/"
            className="font-semibold transition-colors hover:text-[var(--brand-from)]"
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

        <div className="blog-lang-switch" aria-label="Language switcher">
          {lang === "vi" ? (
            <span className="blog-lang-switch-active">
              VI
            </span>
          ) : (
            <Link
              href={`/blog/${slug}/`}
              className="blog-lang-switch-link"
            >
              VI
            </Link>
          )}
          <span
            className="h-5 w-px"
            style={{ backgroundColor: "var(--border-warm-md)" }}
          />
          {lang === "en" ? (
            <span className="blog-lang-switch-active">
              EN
            </span>
          ) : (
            <Link
              href={`/blog/${slug}/en/`}
              className="blog-lang-switch-link"
            >
              EN
            </Link>
          )}
        </div>
      </div>

      <div className="blog-reading-rail">
        <span>
          <strong>Updated</strong>{" "}
          <time className="font-mono tabular-nums">{frontMatter.date}</time>
        </span>
        <span>
          <strong>Read time</strong> {formatReadTime(readTimeMinutes, lang)}
        </span>
        {seriesName ? (
          <span>
            <strong>Series</strong> {seriesName}
          </span>
        ) : null}
      </div>

      <h1
        className="blog-post-title"
        style={{ color: "var(--foreground)" }}
      >
        {frontMatter.title}
      </h1>

      {frontMatter.excerpt ? (
        <p
          className="blog-post-dek"
          style={{ color: "var(--foreground-secondary)" }}
        >
          {frontMatter.excerpt}
        </p>
      ) : null}
    </header>
  );
}
