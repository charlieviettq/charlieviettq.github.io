import Link from "next/link";
import ReactMarkdown from "react-markdown";

import type { SeriesNav } from "@/lib/series-nav";

type Props = {
  nav: SeriesNav;
  lang: "vi" | "en";
};

function SeriesLinkContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      components={{
        a: ({ href, children }) => (
          <Link
            href={href ?? "#"}
            className="font-medium transition-colors hover:text-amber-600 dark:hover:text-amber-400"
            style={{ color: "var(--heading-h2)" }}
          >
            {children}
          </Link>
        ),
        p: ({ children }) => <span>{children}</span>,
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}

export function BlogSeriesNav({ nav, lang }: Props) {
  const sectionTitle = lang === "vi" ? "Chuỗi bài viết" : "In this series";

  return (
    <section className="mt-12" aria-labelledby="series-nav-title">
      <h2
        id="series-nav-title"
        className="mb-3 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--foreground-secondary)" }}
      >
        {sectionTitle}
      </h2>
      <div
        className="warm-card rounded-xl border-l-[3px] p-5"
        style={{ borderLeftColor: "var(--heading-h2)" }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p
            className="text-base font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            {nav.seriesName}
          </p>
          <span
            className="rounded-md px-2 py-0.5 font-mono text-xs tabular-nums"
            style={{
              backgroundColor: "color-mix(in srgb, var(--heading-h2) 12%, transparent)",
              color: "var(--heading-h2)",
            }}
          >
            {nav.episode}
          </span>
        </div>

        {nav.links.length > 0 ? (
          <ul
            className="mt-4 space-y-2 border-t pt-4 text-sm"
            style={{ borderColor: "var(--border-warm)" }}
          >
            {nav.links.map((link) => (
              <li key={link.label} className="flex flex-wrap gap-x-2 gap-y-1">
                <span
                  className="shrink-0 font-medium"
                  style={{ color: "var(--foreground-secondary)" }}
                >
                  {link.label}:
                </span>
                <span style={{ color: "var(--foreground)" }}>
                  <SeriesLinkContent markdown={link.markdown} />
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
