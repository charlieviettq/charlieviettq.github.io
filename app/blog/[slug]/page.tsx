import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostBody } from "@/components/BlogPostBody";
import { splitBilingualMarkdown } from "@/lib/bilingual-post";
import {
  getCategoryLabel,
  getCategoryPillClasses,
  getPostBySlug,
  getPostSlugs,
} from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage(props: Props) {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const parts = splitBilingualMarkdown(post.content);
  const bilingual = parts !== null;
  const viMarkdown = parts?.vi ?? post.content;
  const enMarkdown = parts?.en ?? post.content;

  return (
    <BlogPostBody
      title={post.title}
      date={post.date}
      excerpt={post.excerpt}
      categoryLabel={getCategoryLabel(post.category)}
      categoryPillClass={getCategoryPillClasses(post.category)}
      viMarkdown={viMarkdown}
      enMarkdown={enMarkdown}
      bilingual={bilingual}
    />
  );
}
