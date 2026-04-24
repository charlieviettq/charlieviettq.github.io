"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_PILLS,
  snippetFromMatch,
} from "@/lib/blog-search";
import { useBlogSearchIndex } from "@/hooks/useBlogSearchIndex";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const { data, loadError, fuse } = useBlogSearchIndex();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMac(
      typeof navigator !== "undefined" &&
        /Mac|iPhone|iPad|iPod/i.test(navigator.platform),
    );
  }, []);

  const trimmed = query.trim();
  const results = useMemo(() => {
    if (!fuse || trimmed.length < 2) return [];
    return fuse.search(trimmed, { limit: 12 }).map((r) => ({
      item: r.item,
      snippet: snippetFromMatch(r.item, r),
    }));
  }, [fuse, trimmed]);

  useEffect(() => {
    setHighlighted(0);
  }, [trimmed, open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const openResult = useCallback(
    (slug: string) => {
      close();
      router.push(`/blog/${slug}/`);
    },
    [close, router],
  );

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) setQuery("");
          return !prev;
        });
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const panel = panelRef.current;
      if (panel && !panel.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open, close]);

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      const slug = results[highlighted]?.item.slug;
      if (slug) openResult(slug);
    }
  };

  const shortcutHint = isMac ? "⌘K" : "Ctrl+K";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/90 px-3 py-1.5 text-sm text-zinc-600 shadow-sm transition hover:border-amber-300/70 hover:bg-white hover:text-zinc-900 dark:border-zinc-700/40 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:border-amber-500/50 dark:hover:bg-zinc-900"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Tìm kiếm blog / Search blog"
      >
        <SearchIcon className="text-amber-500 dark:text-amber-400" />
        <span className="hidden font-medium sm:inline">Tìm kiếm</span>
        <kbd className="hidden rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 sm:inline-block">
          {shortcutHint}
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-zinc-950/50 px-4 pb-8 pt-16 backdrop-blur-sm sm:pt-24"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-search-title"
            className="search-dialog-enter w-full max-w-lg rounded-2xl border border-zinc-200/60 bg-gradient-to-b from-white to-zinc-50/95 p-1 shadow-2xl shadow-zinc-900/20 dark:border-zinc-700/40 dark:from-zinc-900 dark:to-zinc-950/95 dark:shadow-black/40"
          >
            <div className="rounded-xl bg-white/80 p-4 dark:bg-zinc-950/80">
              <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-3 dark:border-zinc-700/80">
                <SearchIcon className="shrink-0 text-amber-500 dark:text-amber-400" />
                <div className="min-w-0 flex-1">
                  <h2 id="global-search-title" className="sr-only">
                    Tìm kiếm bài blog
                  </h2>
                  <input
                    ref={inputRef}
                    type="search"
                    autoComplete="off"
                    placeholder="Tìm bài blog… / Search posts…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onInputKeyDown}
                    className="w-full border-0 bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    aria-describedby="global-search-hint"
                  />
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  Esc
                </button>
              </div>
              <p id="global-search-hint" className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {loadError ??
                  (data === null
                    ? "Đang tải chỉ mục…"
                    : `Full-text · ${data.length} bài · ≥2 ký tự · ↑↓ Enter`)}
              </p>

              {trimmed.length >= 2 && results.length === 0 && data && data.length > 0 ? (
                <p className="mt-4 text-center text-sm text-zinc-500">Không có kết quả.</p>
              ) : null}

              {results.length > 0 ? (
                <ul className="mt-3 max-h-[min(50vh,320px)] space-y-1 overflow-y-auto overscroll-contain pr-1">
                  {results.map(({ item, snippet }, index) => (
                    <li key={item.slug}>
                      <button
                        type="button"
                        onClick={() => openResult(item.slug)}
                        onMouseEnter={() => setHighlighted(index)}
                        className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                          index === highlighted
                            ? "border-amber-400/70 bg-amber-50/80 dark:border-amber-500/40 dark:bg-amber-950/30"
                            : "border-transparent bg-zinc-50/50 hover:border-zinc-200 hover:bg-white dark:bg-zinc-900/30 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/60"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                            {item.date}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_PILLS[item.category] ?? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"}`}
                          >
                            {CATEGORY_LABELS[item.category] ?? item.category}
                          </span>
                        </div>
                        <p className="mt-0.5 font-semibold text-amber-800 dark:text-amber-300">
                          {item.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {snippet}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
