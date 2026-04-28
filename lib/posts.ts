import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export const BLOG_CATEGORY_ORDER = [
  "data-science",
  "data-engineering",
  "gen-ai",
  "banking",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORY_ORDER)[number];

const CATEGORY_SET = new Set<string>(BLOG_CATEGORY_ORDER);

export type PostVisibility = "public" | "private";

/** Optional: `case-study` enables hero + KPI strip in BlogPostBody. */
export type PostLayout = "default" | "case-study";

export type PostKpi = {
  labelVi: string;
  labelEn: string;
  value: string;
};

export type PostMeta = {
  slug: string;
  title: string;
  /** Short label shown in BlogNav sidebar (falls back to title if absent). */
  navTitle?: string;
  date: string;
  excerpt?: string;
  category: BlogCategory;
  visibility: PostVisibility;
  layout: PostLayout;
  kpis: PostKpi[];
};

export type Post = PostMeta & { content: string };

export function getCategoryLabel(cat: BlogCategory): string {
  const labels: Record<BlogCategory, string> = {
    "data-science": "Data Science",
    "data-engineering": "Data Engineering",
    "gen-ai": "Gen AI",
    banking: "Banking Domain",
  };
  return labels[cat];
}

/** Subtitle shown under section titles (Vietnamese). */
export function getCategorySubtitleVi(cat: BlogCategory): string {
  const subtitles: Record<BlogCategory, string> = {
    "data-science": "Mô hình, đánh giá ngoài mẫu & độ ổn định dữ liệu.",
    "data-engineering": "Pipeline, warehouse, chất lượng DAG & contract dữ liệu.",
    "gen-ai": "RAG, agent, đánh giá grounding & ranh giới công cụ.",
    banking: "Vòng đời tín dụng, scorecard & giám sát quyết định (góc kỹ thuật).",
  };
  return subtitles[cat];
}

/** Tailwind classes for category pills (blog list + post header). */
export function getCategoryPillClasses(cat: BlogCategory): string {
  const map: Record<BlogCategory, string> = {
    "data-science":
      "bg-sky-100 text-sky-900 ring-1 ring-sky-200/90 dark:bg-sky-950/55 dark:text-sky-200 dark:ring-sky-500/35",
    "data-engineering":
      "bg-indigo-100 text-indigo-900 ring-1 ring-indigo-200/90 dark:bg-indigo-950/55 dark:text-indigo-200 dark:ring-indigo-500/35",
    "gen-ai":
      "bg-purple-100 text-purple-900 ring-1 ring-purple-200/90 dark:bg-purple-950/55 dark:text-purple-200 dark:ring-purple-500/35",
    banking:
      "bg-amber-100 text-amber-900 ring-1 ring-amber-200/90 dark:bg-amber-950/55 dark:text-amber-200 dark:ring-amber-500/35",
  };
  return map[cat];
}

/** Tinted background classes for category section banners (blog index). */
export function getCategoryBannerClasses(cat: BlogCategory): string {
  const map: Record<BlogCategory, string> = {
    "data-science":    "bg-sky-100/70 dark:bg-sky-950/30",
    "data-engineering":"bg-indigo-100/70 dark:bg-indigo-950/30",
    "gen-ai":          "bg-purple-100/70 dark:bg-purple-950/30",
    "banking":         "bg-amber-100/70 dark:bg-amber-950/30",
  };
  return map[cat] ?? "";
}

function parseCategory(raw: unknown, slug: string): BlogCategory {
  const s = String(raw ?? "").trim();
  if (!CATEGORY_SET.has(s)) {
    throw new Error(
      `Invalid or missing category "${raw}" for post "${slug}.md". Expected one of: ${BLOG_CATEGORY_ORDER.join(", ")}`,
    );
  }
  return s as BlogCategory;
}

function parseVisibility(raw: unknown, slug: string): PostVisibility {
  const s = String(raw ?? "").trim().toLowerCase();
  if (s === "" || s === "public") return "public";
  if (s === "private") return "private";
  throw new Error(
    `Invalid visibility "${raw}" for post "${slug}.md". Expected "public" or "private".`,
  );
}

function parseLayout(raw: unknown, slug: string): PostLayout {
  const s = String(raw ?? "").trim().toLowerCase();
  if (s === "" || s === "default") return "default";
  if (s === "case-study") return "case-study";
  throw new Error(
    `Invalid layout "${raw}" for post "${slug}.md". Expected "default" or "case-study".`,
  );
}

function parseKpis(raw: unknown, slug: string): PostKpi[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    throw new Error(`Invalid kpis for post "${slug}.md": expected an array.`);
  }
  return raw.map((item, i) => {
    if (item == null || typeof item !== "object") {
      throw new Error(`Invalid kpis[${i}] for post "${slug}.md".`);
    }
    const o = item as Record<string, unknown>;
    const labelVi = String(o.label_vi ?? o.labelVi ?? "").trim();
    const labelEn = String(o.label_en ?? o.labelEn ?? "").trim();
    const value = String(o.value ?? "").trim();
    if (!labelVi || !labelEn || !value) {
      throw new Error(
        `kpis[${i}] for post "${slug}.md" needs label_vi, label_en, and value.`,
      );
    }
    return { labelVi, labelEn, value };
  });
}

/** Listed on /blog/ and in search index. */
export function isListedPost(p: PostMeta): boolean {
  return p.visibility === "public";
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const category = parseCategory(data.category, slug);
  const visibility = parseVisibility(data.visibility, slug);
  return {
    slug,
    title: String(data.title ?? slug),
    navTitle:
      data.navTitle != null
        ? String(data.navTitle).trim() || undefined
        : undefined,
    date: String(data.date ?? ""),
    excerpt: data.excerpt != null ? String(data.excerpt) : undefined,
    category,
    visibility,
    layout: parseLayout(data.layout, slug),
    kpis: parseKpis(data.kpis, slug),
    content,
  };
}

export function getAllPosts(): Post[] {
  return getPostSlugs()
    .map((s) => getPostBySlug(s))
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostsByCategory(category: BlogCategory): Post[] {
  return getAllPosts().filter(
    (p) => p.category === category && isListedPost(p),
  );
}

export function getRelatedPosts(
  slug: string,
  currentPost: PostMeta,
  limit = 3,
): PostMeta[] {
  const candidates = getAllPosts().filter(
    (p) => isListedPost(p) && p.slug !== slug,
  );
  const currentText =
    `${currentPost.title} ${currentPost.excerpt ?? ""}`.toLowerCase();
  const currentWords = new Set(
    currentText.split(/\W+/).filter((w) => w.length > 4),
  );
  const scored = candidates.map((p) => {
    const pText = `${p.title} ${p.excerpt ?? ""}`.toLowerCase();
    const pWords = new Set(pText.split(/\W+/).filter((w) => w.length > 4));
    const overlap = [...currentWords].filter((w) => pWords.has(w)).length;
    const sameCat = p.category === currentPost.category ? 3 : 0;
    return { post: p, score: overlap + sameCat };
  });
  return scored
    .sort(
      (a, b) =>
        b.score - a.score || b.post.date.localeCompare(a.post.date),
    )
    .slice(0, limit)
    .map((s) => s.post);
}

export function getAdjacentPosts(slug: string): {
  prev: PostMeta | null;
  next: PostMeta | null;
} {
  const posts = getAllPosts().filter(isListedPost); // newest-first
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx < posts.length - 1 ? posts[idx + 1] : null, // older post
    next: idx > 0 ? posts[idx - 1] : null,                // newer post
  };
}
