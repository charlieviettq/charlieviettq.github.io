"use client";

import { useEffect, useMemo, useState } from "react";

import type { TocItem } from "@/lib/toc";

type Props = {
  items: TocItem[];
  lang?: "vi" | "en";
};

export function BlogToc({ items }: Props) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0) return;

    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) =>
            a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1,
          );
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -72% 0px", threshold: [0, 1] },
    );

    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [ids]);

  if (items.length === 0) return null;

  const label = "Contents";

  return (
    <aside className="blog-toc-desktop">
      <p className="blog-toc-title">{label}</p>
      <nav aria-label="Table of contents" className="blog-toc-nav">
        {items.map((it) => {
          const active = activeId === it.id;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              className={[
                "blog-toc-link",
                it.level === 3 ? "blog-toc-link-nested" : "",
                active ? "toc-link-active" : "",
              ].join(" ")}
            >
              {it.title}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileBlogToc({ items }: Props) {
  if (items.length === 0) return null;

  const label = "On this page";

  return (
    <details className="blog-toc-mobile">
      <summary>{label}</summary>
      <nav aria-label="Table of contents">
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            className={it.level === 3 ? "blog-toc-mobile-nested" : undefined}
          >
            {it.title}
          </a>
        ))}
      </nav>
    </details>
  );
}
