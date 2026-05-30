"use client";

import { useEffect, useMemo, useState } from "react";

import type { TocItem } from "@/lib/toc";

type Props = {
  items: TocItem[];
  lang?: "vi" | "en";
};

export function BlogToc({ items, lang = "vi" }: Props) {
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

  const label = lang === "vi" ? "Mục lục" : "Contents";

  return (
    <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-64 shrink-0 overflow-auto pr-2 xl:block">
      <div className="rounded-2xl border border-[var(--border-warm)] bg-surface-100/80 p-4 shadow-sm backdrop-blur dark:bg-surface-300/40">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--foreground-secondary)" }}
        >
          {label}
        </p>
        <nav aria-label="Table of contents" className="space-y-1 text-sm">
          {items.map((it) => {
            const active = activeId === it.id;
            return (
              <a
                key={it.id}
                href={`#${it.id}`}
                className={[
                  "block rounded-md border-l-2 py-1 pl-2.5 pr-2 transition",
                  it.level === 3 ? "ml-3 text-[0.92em]" : "",
                  active
                    ? "toc-link-active border-amber-500/70 bg-amber-500/8"
                    : "border-transparent hover:border-[var(--border-warm-md)] hover:bg-surface-300/40",
                ].join(" ")}
                style={
                  active
                    ? undefined
                    : { color: "var(--foreground-secondary)" }
                }
              >
                {it.title}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
