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
            className="font-semibold transition-colors hover:text-[var(--brand-from)]"
            style={{ color: "var(--foreground)" }}
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

export function BlogSeriesNav({ nav }: Props) {
  const episode = nav.episode.toLowerCase();
  const sectionTitle =
    episode.includes("related") || episode.includes("bài viết liên quan")
      ? "Related Posts"
      : "In This Series";

  return (
    <section className="blog-series-panel" aria-labelledby="series-nav-title">
      <h2
        id="series-nav-title"
        className="blog-series-kicker"
      >
        {sectionTitle}
      </h2>
      <div className="blog-series-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p
            className="text-base font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {nav.seriesName}
          </p>
          <span
            className="blog-series-episode"
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
