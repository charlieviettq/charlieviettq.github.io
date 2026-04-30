import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostFrontMatter = {
  title: string;
  date: string; // YYYY-MM-DD
  excerpt?: string;
  category?: "data-science" | "data-engineering" | "gen-ai" | "banking";
  visibility?: "public" | "private";
  layout?: "default" | "case-study";
  kpis?: Array<{ label_vi: string; label_en: string; value: string }>;
};

export type Post = {
  slug: string;
  frontMatter: PostFrontMatter;
  content: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function isDate(x: unknown): x is Date {
  return typeof x === "object" && x !== null && x instanceof Date;
}

function assertPostsDirExists() {
  if (!fs.existsSync(POSTS_DIR)) {
    throw new Error(
      `Posts directory not found: ${POSTS_DIR}. Create content/posts and add markdown posts.`,
    );
  }
}

export function getPostSlugs(): string[] {
  assertPostsDirExists();
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getPostBySlug(slug: string): Post {
  assertPostsDirExists();
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Post not found: ${slug}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const rawFrontMatter = data as Partial<PostFrontMatter> & { date?: unknown };
  const rawDate = rawFrontMatter.date as unknown;
  const date = isDate(rawDate)
    ? rawDate.toISOString().slice(0, 10)
    : String(rawDate ?? "");

  const frontMatter: PostFrontMatter = {
    ...(rawFrontMatter as PostFrontMatter),
    date,
  };

  if (!frontMatter?.title || !frontMatter?.date) {
    throw new Error(`Invalid front matter in ${filePath} (title/date required)`);
  }

  return { slug, frontMatter, content };
}

export function getAllPosts(): Array<Omit<Post, "content">> {
  const slugs = getPostSlugs();
  const posts = slugs.map((slug) => {
    const post = getPostBySlug(slug);
    return { slug: post.slug, frontMatter: post.frontMatter };
  });

  return posts.sort((a, b) => {
    // newest first; expects YYYY-MM-DD format
    return a.frontMatter.date < b.frontMatter.date ? 1 : -1;
  });
}

