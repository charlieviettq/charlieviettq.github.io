"use client";

import { useEffect, useMemo, useState } from "react";

import type { TocItem } from "@/lib/toc";

type Props = {
  items: TocItem[];
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
        // pick the top-most visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1));
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -72% 0px", threshold: [0, 1] },
    );

    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [ids]);

  if (items.length === 0) return null;

  return (
    <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-64 shrink-0 overflow-auto pr-2 xl:block">
      <div className="rounded-2xl border border-zinc-200 bg-white/60 p-4 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/40">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          On this page
        </p>
        <nav aria-label="Table of contents" className="space-y-1.5 text-sm">
          {items.map((it) => {
            const active = activeId === it.id;
            return (
              <a
                key={it.id}
                href={`#${it.id}`}
                className={[
                  "block rounded-md px-2 py-1 transition",
                  it.level === 3 ? "ml-3 text-[0.92em]" : "",
                  active
                    ? "bg-amber-500/10 text-amber-800 dark:text-amber-200"
                    : "text-zinc-600 hover:bg-zinc-500/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-zinc-100",
                ].join(" ")}
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

