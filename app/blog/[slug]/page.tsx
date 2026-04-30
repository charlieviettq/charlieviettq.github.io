import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogPostBody } from "@/components/BlogPostBody";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";

export const dynamic = "error";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {post.frontMatter.category ?? "banking"} ·{" "}
          <time>{post.frontMatter.date}</time>
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {post.frontMatter.title}
        </h1>
        {post.frontMatter.excerpt ? (
          <p className="mt-3 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            {post.frontMatter.excerpt}
          </p>
        ) : null}

        <div className="mt-5">
          <Link
            href="/blog/"
            className="text-sm font-semibold text-amber-700 underline decoration-amber-400/60 underline-offset-4 hover:decoration-amber-500 dark:text-amber-300"
          >
            ← Back to Blog
          </Link>
        </div>
      </header>

      <BlogPostBody content={post.content} />
    </article>
  );
}

