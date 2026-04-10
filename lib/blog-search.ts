import Fuse, { type FuseResult } from "fuse.js";

export type SearchIndexEntry = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  textVi: string;
  textEn: string;
};

export const CATEGORY_LABELS: Record<string, string> = {
  "data-science": "Data Science",
  "data-engineering": "Data Engineering",
  "gen-ai": "Gen AI",
  banking: "Banking Domain",
};

export const CATEGORY_PILLS: Record<string, string> = {
  "data-science":
    "bg-sky-100 text-sky-900 ring-1 ring-sky-200/90 dark:bg-sky-950/55 dark:text-sky-200 dark:ring-sky-500/35",
  "data-engineering":
    "bg-indigo-100 text-indigo-900 ring-1 ring-indigo-200/90 dark:bg-indigo-950/55 dark:text-indigo-200 dark:ring-indigo-500/35",
  "gen-ai":
    "bg-violet-100 text-violet-900 ring-1 ring-violet-200/90 dark:bg-violet-950/55 dark:text-violet-200 dark:ring-violet-500/35",
  banking:
    "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/90 dark:bg-emerald-950/55 dark:text-emerald-200 dark:ring-emerald-500/35",
};

export function snippetFromMatch(
  item: SearchIndexEntry,
  result: FuseResult<SearchIndexEntry>,
): string {
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

export function createBlogFuse(data: SearchIndexEntry[]) {
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
}
