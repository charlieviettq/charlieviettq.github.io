"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/bilingual-post";

export function BlogToc({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  /* ── IntersectionObserver: track the heading currently in view ─────────── */
  useEffect(() => {
    if (!toc.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -75% 0px", threshold: 0 },
    );

    const els = toc
      .map((t) => document.getElementById(t.id))
      .filter(Boolean) as HTMLElement[];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  if (!toc.length) return null;

  return (
    <aside className="hidden xl:block shrink-0" style={{ width: "200px" }}>
      <div
        className="sticky top-20 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 5rem)" }}
      >
        <p
          className="mb-3 text-[9px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "var(--foreground-secondary)" }}
        >
          On this page
        </p>
        <ul className="space-y-1.5">
          {toc.map((item, i) => {
            const isActive = item.id === activeId;
            return (
              <li
                key={`${item.id}-${i}`}
                className={item.depth === 3 ? "pl-3" : undefined}
              >
                <a
                  href={`#${item.id}`}
                  className="flex items-center gap-1.5 text-[0.75rem] leading-snug underline-offset-2 transition-colors hover:underline"
                  style={{
                    color: isActive
                      ? "var(--brand-from)"
                      : "var(--foreground-secondary)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--brand-from)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--foreground-secondary)";
                  }}
                >
                  {isActive && (
                    <span
                      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: "var(--brand-from)" }}
                    />
                  )}
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
