"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/bilingual-post";

type Lang = "vi" | "en";

type Props = {
  open: boolean;
  onToggle: () => void;
  /** TocItem[] for IntersectionObserver (not rendered ReactNode) */
  toc: TocItem[];
  bilingual: boolean;
  splitView: boolean;
  onSplitToggle: () => void;
  lang: Lang;
  onLangChange: (l: Lang) => void;
};

export function PostLeftSidebar({
  open,
  onToggle,
  toc,
  bilingual,
  splitView,
  onSplitToggle,
  lang,
  onLangChange,
}: Props) {
  const [activeId, setActiveId] = useState<string>("");

  // ── IntersectionObserver: track active heading while scrolling ────────────
  useEffect(() => {
    if (toc.length === 0) return;
    const headingIds = toc.map((t) => t.id);

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-10% 0px -75% 0px", threshold: 0 },
    );

    const els = headingIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [toc]);

  return (
    <aside
      className={`hidden lg:flex lg:flex-col shrink-0 border-r border-zinc-200/50 dark:border-zinc-700/40 transition-[width] duration-200 ease-in-out ${
        open ? "w-52" : "w-10"
      }`}
    >
      <div
        className="sticky top-20 flex flex-col"
        style={{ maxHeight: "calc(100vh - 5rem)" }}
      >
        {/* Collapse / expand toggle */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Thu gọn sidebar" : "Mở rộng sidebar"}
          className={`flex shrink-0 items-center py-3 text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors ${
            open ? "justify-end pr-3" : "justify-center"
          }`}
        >
          {open ? (
            <span className="text-[11px] font-medium">← Thu</span>
          ) : (
            <span className="text-base">☰</span>
          )}
        </button>

        {/* Sidebar content — only when open */}
        {open && (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
            {/* TOC with active highlighting */}
            {toc.length > 0 && (
              <nav aria-label="Mục lục / Table of contents">
                <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  On this page
                </p>
                <ul className="space-y-2 text-sm">
                  {toc.map((item, index) => {
                    const isActive = item.id === activeId;
                    return (
                      <li
                        key={`${item.id}-${index}`}
                        className={item.depth === 3 ? "pl-3" : undefined}
                      >
                        <a
                          href={`#${item.id}`}
                          className={`block underline-offset-2 transition-colors hover:underline ${
                            isActive
                              ? "font-semibold text-amber-600 dark:text-amber-400"
                              : "text-zinc-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400"
                          }`}
                        >
                          {isActive && (
                            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-middle" />
                          )}
                          {item.text}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}

            {/* View + language controls — only for bilingual posts */}
            {bilingual && (
              <>
                <hr className="my-4 border-zinc-200/60 dark:border-zinc-700/40" />

                <div className="space-y-4">
                  {/* View mode: Single / Split */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      Chế độ xem
                    </p>
                    <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
                      <button
                        type="button"
                        onClick={() => {
                          if (splitView) onSplitToggle();
                        }}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                          !splitView
                            ? "bg-amber-600 text-white shadow-sm"
                            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        }`}
                      >
                        Single
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!splitView) onSplitToggle();
                        }}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                          splitView
                            ? "bg-amber-600 text-white shadow-sm"
                            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        }`}
                      >
                        Split
                      </button>
                    </div>
                  </div>

                  {/* Language toggle — only in single mode */}
                  {!splitView && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        Ngôn ngữ
                      </p>
                      <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
                        <button
                          type="button"
                          onClick={() => onLangChange("vi")}
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                            lang === "vi"
                              ? "bg-amber-600 text-white shadow-sm"
                              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                          }`}
                        >
                          VI 🇻🇳
                        </button>
                        <button
                          type="button"
                          onClick={() => onLangChange("en")}
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                            lang === "en"
                              ? "bg-amber-600 text-white shadow-sm"
                              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                          }`}
                        >
                          EN 🇬🇧
                        </button>
                      </div>
                    </div>
                  )}

                  {splitView && (
                    <p className="text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500">
                      Đang hiện cả<br />
                      🇻🇳 VI · 🇬🇧 EN
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
