import { notFound } from "next/navigation";

import { BlogPostBody } from "@/components/BlogPostBody";
import { BlogPostHeader } from "@/components/blog/BlogPostHeader";
import { BlogSeriesNav } from "@/components/blog/BlogSeriesNav";
import { BlogToc } from "@/components/blog/BlogToc";
import { splitBilingualMarkdown } from "@/lib/bilingual";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { preparePostContent } from "@/lib/prepare-content";
import { estimateReadTimeMinutes } from "@/lib/read-time";
import { buildTocFromMarkdown } from "@/lib/toc";

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

  const split = splitBilingualMarkdown(post.content);
  const rawContent = [split.common, split.vi || split.en]
    .filter(Boolean)
    .join("\n\n");
  const { content, seriesNav } = preparePostContent(rawContent);
  const readTimeMinutes = estimateReadTimeMinutes(content);

  const toc = buildTocFromMarkdown(content).filter(
    (it) => it.title !== "References" && it.title !== "Tham khảo / References",
  );

  return (
    <article className="mx-auto max-w-6xl">
      <BlogPostHeader
        slug={slug}
        frontMatter={post.frontMatter}
        lang="vi"
        readTimeMinutes={readTimeMinutes}
      />

      <div className="mx-auto flex max-w-6xl items-start gap-8">
        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-3xl">
            <BlogPostBody content={content} />
            {seriesNav ? <BlogSeriesNav nav={seriesNav} lang="vi" /> : null}
          </div>
        </div>
        <BlogToc items={toc} lang="vi" />
      </div>
    </article>
  );
}
