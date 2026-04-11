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

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  category: BlogCategory;
  visibility: PostVisibility;
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
      "bg-violet-100 text-violet-900 ring-1 ring-violet-200/90 dark:bg-violet-950/55 dark:text-violet-200 dark:ring-violet-500/35",
    banking:
      "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/90 dark:bg-emerald-950/55 dark:text-emerald-200 dark:ring-emerald-500/35",
  };
  return map[cat];
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
    date: String(data.date ?? ""),
    excerpt: data.excerpt != null ? String(data.excerpt) : undefined,
    category,
    visibility,
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
