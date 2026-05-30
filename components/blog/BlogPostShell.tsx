import { notFound } from "next/navigation";

import { BlogPostBody } from "@/components/BlogPostBody";
import { BlogPostHeader } from "@/components/blog/BlogPostHeader";
import { BlogSeriesNav } from "@/components/blog/BlogSeriesNav";
import { BlogToc, MobileBlogToc } from "@/components/blog/BlogToc";
import { splitBilingualMarkdown } from "@/lib/bilingual";
import { getPostBySlug } from "@/lib/posts";
import { preparePostContent } from "@/lib/prepare-content";
import { estimateReadTimeMinutes } from "@/lib/read-time";
import { buildTocFromMarkdown } from "@/lib/toc";

type Props = {
  slug: string;
  lang: "vi" | "en";
};

export function BlogPostShell({ slug, lang }: Props) {
  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const split = splitBilingualMarkdown(post.content);
  const rawContent = [
    split.common,
    lang === "vi" ? split.vi || split.en : split.en || split.vi,
  ]
    .filter(Boolean)
    .join("\n\n");

  const { content, seriesNav } = preparePostContent(rawContent);
  const readTimeMinutes = estimateReadTimeMinutes(content);
  const toc = buildTocFromMarkdown(content).filter(
    (it) =>
      !["VI", "EN", "References", "Tham khảo / References"].includes(it.title),
  );

  return (
    <article className="blog-post-shell">
      <BlogPostHeader
        slug={slug}
        frontMatter={post.frontMatter}
        lang={lang}
        readTimeMinutes={readTimeMinutes}
        seriesName={seriesNav?.seriesName}
      />

      <div className="blog-reading-layout">
        <BlogToc items={toc} lang={lang} />
        <div className="blog-reading-main">
          <MobileBlogToc items={toc} lang={lang} />
          <BlogPostBody content={content} />
          {seriesNav ? <BlogSeriesNav nav={seriesNav} lang={lang} /> : null}
        </div>
      </div>
    </article>
  );
}
