import Link from "next/link";

import {
  getCategoryLabel,
  type PostCategory,
} from "@/lib/category";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "error";

const categoryOrder: PostCategory[] = [
  "banking",
  "data-science",
  "data-engineering",
  "gen-ai",
];

function formatCategoryCount(count: number) {
  return `${count} ${count === 1 ? "note" : "notes"}`;
}

export default function BlogIndexPage() {
  const posts = getAllPosts().filter(
    (p) => (p.frontMatter.visibility ?? "public") === "public",
  );

  const latestDate = posts[0]?.frontMatter.date ?? "N/A";
  const categoryCounts = categoryOrder.map((category) => ({
    category,
    count: posts.filter((p) => (p.frontMatter.category ?? "banking") === category)
      .length,
  }));

  return (
    <section className="blog-index-page">
      <div className="blog-index-stats" aria-label="Blog summary">
        <div>
          <span>Total posts</span>
          <strong>{posts.length}</strong>
        </div>
        <div>
          <span>Latest</span>
          <strong>{latestDate}</strong>
        </div>
        <div>
          <span>Topics</span>
          <strong>{categoryCounts.filter((c) => c.count > 0).length}</strong>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="blog-empty-state">
          <p>No posts yet.</p>
          <span>
            Add markdown files under <code>content/posts/</code>.
          </span>
        </div>
      ) : (
        <div className="blog-category-stack">
          {categoryCounts
            .filter(({ count }) => count > 0)
            .map(({ category, count }) => {
              const categoryPosts = posts.filter(
                (p) => (p.frontMatter.category ?? "banking") === category,
              );
              return (
                <section key={category} className="blog-category-section">
                  <div className="blog-category-heading">
                    <div>
                      <h2>{getCategoryLabel(category)}</h2>
                    </div>
                    <p>{formatCategoryCount(count)}</p>
                  </div>

                  <div className="blog-publication-list">
                    {categoryPosts.map((p) => (
                      <article key={p.slug} className="blog-publication-row">
                        <div className="blog-publication-meta">
                          <time>{p.frontMatter.date}</time>
                          <span>VI / EN</span>
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/blog/${p.slug}/`}
                            className="blog-publication-title"
                          >
                            {p.frontMatter.title}
                          </Link>
                          {p.frontMatter.excerpt ? (
                            <p className="blog-publication-excerpt">
                              {p.frontMatter.excerpt}
                            </p>
                          ) : null}
                          <div className="blog-publication-actions">
                            <Link href={`/blog/${p.slug}/`} className="lang-chip">
                              Vietnamese
                            </Link>
                            <Link href={`/blog/${p.slug}/en/`} className="lang-chip">
                              English
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
        </div>
      )}
    </section>
  );
}
