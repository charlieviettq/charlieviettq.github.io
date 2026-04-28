import {
  getAllPosts,
  BLOG_CATEGORY_ORDER,
  getCategoryLabel,
} from "@/lib/posts";
import { BlogNav } from "@/components/blog/BlogNav";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allPosts = getAllPosts();

  // Pre-group posts by category on the server — BlogNav only receives plain data
  const grouped = BLOG_CATEGORY_ORDER.map((cat) => ({
    cat,
    label: getCategoryLabel(cat),
    posts: allPosts
      .filter((p) => p.category === cat)
      .map((p) => ({ slug: p.slug, title: p.title, navTitle: p.navTitle })),
  })).filter((g) => g.posts.length > 0);

  return (
    <div className="flex min-h-screen">
      {/* Left: site-wide blog navigation */}
      <BlogNav grouped={grouped} />

      {/* Center + Right: page content area */}
      <div className="min-w-0 flex-1 px-4 py-10 lg:px-8">{children}</div>
    </div>
  );
}
