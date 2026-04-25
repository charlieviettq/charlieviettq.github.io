import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostBody } from "@/components/BlogPostBody";
import { PostNav } from "@/components/blog/PostNav";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { BlogToc } from "@/components/blog/BlogToc";
import { splitBilingualMarkdown, extractToc } from "@/lib/bilingual-post";
import {
  getAdjacentPosts,
  getCategoryLabel,
  getCategoryPillClasses,
  getPostBySlug,
  getPostSlugs,
  getRelatedPosts,
} from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  const base: Metadata = { title: post.title, description: post.excerpt };
  if (post.visibility === "private") {
    return { ...base, robots: { index: false, follow: false } };
  }
  return base;
}

export default async function BlogPostPage(props: Props) {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const parts = splitBilingualMarkdown(post.content);
  const bilingual = parts !== null;
  const viMarkdown = parts?.vi ?? post.content;
  const enMarkdown = parts?.en ?? post.content;
  const { prev, next } = getAdjacentPosts(slug);
  const related = getRelatedPosts(slug, post);

  // Extract TOC from the primary (VI) markdown for the right sidebar
  const toc = extractToc(viMarkdown);

  return (
    <div className="flex items-start gap-8">
      {/* ── Center: post content ───────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        <Link
          href="/blog/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-amber-600 dark:hover:text-amber-400"
        >
          ← All posts
        </Link>
        <BlogPostBody
          title={post.title}
          date={post.date}
          excerpt={post.excerpt}
          categoryLabel={getCategoryLabel(post.category)}
          categoryPillClass={getCategoryPillClasses(post.category)}
          viMarkdown={viMarkdown}
          enMarkdown={enMarkdown}
          bilingual={bilingual}
          layout={post.layout}
          kpis={post.kpis}
        />
        <PostNav prev={prev} next={next} />
        <RelatedPosts posts={related} />
      </div>

      {/* ── Right: "On this page" TOC (xl+ only, rendered by BlogToc) ──────── */}
      <BlogToc toc={toc} />
    </div>
  );
}
