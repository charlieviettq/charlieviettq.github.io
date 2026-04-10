"use client";

import Fuse, { type FuseResult } from "fuse.js";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type SearchIndexEntry = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  textVi: string;
  textEn: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  "data-science": "Data Science",
  "data-engineering": "Data Engineering",
  "gen-ai": "Gen AI",
  banking: "Banking Domain",
};

const CATEGORY_PILLS: Record<string, string> = {
  "data-science":
    "bg-sky-100 text-sky-900 ring-1 ring-sky-200/90 dark:bg-sky-950/55 dark:text-sky-200 dark:ring-sky-500/35",
  "data-engineering":
    "bg-indigo-100 text-indigo-900 ring-1 ring-indigo-200/90 dark:bg-indigo-950/55 dark:text-indigo-200 dark:ring-indigo-500/35",
  "gen-ai":
    "bg-violet-100 text-violet-900 ring-1 ring-violet-200/90 dark:bg-violet-950/55 dark:text-violet-200 dark:ring-violet-500/35",
  banking:
    "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/90 dark:bg-emerald-950/55 dark:text-emerald-200 dark:ring-emerald-500/35",
};

function snippetFromMatch(item: SearchIndexEntry, result: FuseResult<SearchIndexEntry>): string {
  const match = result.matches?.find(
    (m) => m.key === "textVi" || m.key === "textEn",
  );
  if (match?.indices?.length && (match.key === "textVi" || match.key === "textEn")) {
    const text = match.key === "textVi" ? item.textVi : item.textEn;
    const startChar = match.indices[0][0];
    const winStart = Math.max(0, startChar - 48);
    const slice = text.slice(winStart, winStart + 180).trim();
    return `${winStart > 0 ? "…" : ""}${slice}${slice.length + winStart < text.length ? "…" : ""}`;
  }
  if (item.excerpt) return item.excerpt;
  return item.title;
}

export function BlogSearch() {
  const [data, setData] = useState<SearchIndexEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/blog-search-index.json");
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as SearchIndexEntry[];
        if (!cancelled) setData(Array.isArray(json) ? json : []);
      } catch {
        if (!cancelled) {
          setLoadError("Không tải được chỉ mục tìm kiếm.");
          setData([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fuse = useMemo(() => {
    if (!data || data.length === 0) return null;
    return new Fuse(data, {
      keys: [
        { name: "title", weight: 0.38 },
        { name: "excerpt", weight: 0.28 },
        { name: "textVi", weight: 0.17 },
        { name: "textEn", weight: 0.17 },
        { name: "category", weight: 0.05 },
      ],
      threshold: 0.38,
      ignoreLocation: true,
      includeMatches: true,
      minMatchCharLength: 2,
    });
  }, [data]);

  const trimmed = query.trim();
  const results =
    fuse && trimmed.length >= 2
      ? fuse.search(trimmed, { limit: 12 }).map((r) => ({
          item: r.item,
          snippet: snippetFromMatch(r.item, r),
        }))
      : [];

  return (
    <section
      className="rounded-2xl border border-sky-200/70 bg-white/90 p-4 shadow-sm dark:border-sky-500/25 dark:bg-zinc-950/60"
      aria-labelledby="blog-search-heading"
    >
      <h2 id="blog-search-heading" className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
        Tìm bài / Search posts
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Full-text (tiếng Việt + English trong nội dung). Gõ ít nhất 2 ký tự.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label htmlFor="blog-search-input" className="sr-only">
          Từ khóa
        </label>
        <input
          id="blog-search-input"
          type="search"
          autoComplete="off"
          placeholder="Ví dụ: OOT, RAG, dbt…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-inner outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/30"
          aria-describedby="blog-search-hint"
        />
        <button
          type="button"
          onClick={() => setQuery("")}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Xóa
        </button>
      </div>
      <p id="blog-search-hint" className="mt-2 text-xs text-zinc-400">
        {loadError ?? (data === null ? "Đang tải chỉ mục…" : `${data.length} bài trong chỉ mục`)}
      </p>

      {trimmed.length >= 2 && results.length === 0 && data && data.length > 0 ? (
        <p className="mt-3 text-sm text-zinc-500">Không có kết quả.</p>
      ) : null}

      {results.length > 0 ? (
        <ul className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
          {results.map(({ item, snippet }) => (
            <li
              key={item.slug}
              className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  {item.date}
                </span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_PILLS[item.category] ?? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"}`}
                  title={item.category}
                >
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
              </div>
              <Link
                href={`/blog/${item.slug}/`}
                className="mt-1 block text-base font-semibold text-sky-700 hover:underline dark:text-sky-400"
              >
                {item.title}
              </Link>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{snippet}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
