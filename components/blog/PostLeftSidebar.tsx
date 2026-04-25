"use client";

import type { ReactNode } from "react";

type Lang = "vi" | "en";

type Props = {
  open: boolean;
  onToggle: () => void;
  /** Rendered <TocNav> passed from parent — avoids re-exporting TocNav */
  tocNode: ReactNode;
  bilingual: boolean;
  splitView: boolean;
  onSplitToggle: () => void;
  lang: Lang;
  onLangChange: (l: Lang) => void;
};

export function PostLeftSidebar({
  open,
  onToggle,
  tocNode,
  bilingual,
  splitView,
  onSplitToggle,
  lang,
  onLangChange,
}: Props) {
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
            <span
              className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Mục lục
            </span>
          )}
        </button>

        {/* Sidebar content — only when open */}
        {open && (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
            {/* TOC */}
            {tocNode}

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
