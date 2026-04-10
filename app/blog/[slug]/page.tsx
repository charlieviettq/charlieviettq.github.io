import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

  return (
    <article className="space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {post.date}
          </p>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getCategoryPillClasses(post.category)}`}
          >
            {getCategoryLabel(post.category)}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{post.title}</h1>
        {post.excerpt ? (
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            {post.excerpt}
          </p>
        ) : null}
      </header>
      <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-sky-400 prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-900">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
