import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogPostBody } from "@/components/BlogPostBody";
import { BlogToc } from "@/components/blog/BlogToc";
import { splitBilingualMarkdown } from "@/lib/bilingual";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { buildTocFromMarkdown } from "@/lib/toc";

export const dynamic = "error";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostEnPage({
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

  const split = splitBilingualMarkdown(post.content);
  const content = [split.common, split.en || split.vi].filter(Boolean).join("\n\n");

  const toc = buildTocFromMarkdown(content).filter(
    (it) => it.title !== "References" && it.title !== "Tham khảo / References",
  );

  return (
    <article className="mx-auto max-w-6xl">
      <header className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {post.frontMatter.category ?? "banking"} ·{" "}
              <time>{post.frontMatter.date}</time>
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {post.frontMatter.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/60 p-1 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/40">
            <Link
              href={`/blog/${slug}/`}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-500/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-zinc-100"
            >
              VI
            </Link>
            <span className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
            <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
              EN
            </span>
          </div>
        </div>

        {post.frontMatter.excerpt ? (
          <p className="mt-3 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            {post.frontMatter.excerpt}
          </p>
        ) : null}

        <div className="mt-5 flex items-center gap-4">
          <Link
            href="/blog/"
            className="text-sm font-semibold text-amber-700 underline decoration-amber-400/60 underline-offset-4 hover:decoration-amber-500 dark:text-amber-300"
          >
            ← Back to Blog
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl items-start gap-8">
        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-3xl">
            <BlogPostBody content={content} />
          </div>
        </div>
        <BlogToc items={toc} />
      </div>
    </article>
  );
}

