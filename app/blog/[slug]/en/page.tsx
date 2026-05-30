import { BlogPostShell } from "@/components/blog/BlogPostShell";
import { getPostSlugs } from "@/lib/posts";

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
  return <BlogPostShell slug={slug} lang="en" />;
}
