"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createBlogFuse,
  type SearchIndexEntry,
} from "@/lib/blog-search";

export function useBlogSearchIndex() {
  const [data, setData] = useState<SearchIndexEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

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
    return createBlogFuse(data);
  }, [data]);

  return { data, loadError, fuse };
}
