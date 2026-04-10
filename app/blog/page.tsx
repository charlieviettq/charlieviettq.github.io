import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Notes / Ghi chép ngắn — song ngữ trong bài khi phù hợp.
        </p>
      </div>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {post.date}
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              <Link
                href={`/blog/${post.slug}/`}
                className="hover:text-sky-600 dark:hover:text-sky-400"
              >
                {post.title}
              </Link>
            </h2>
            {post.excerpt ? (
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
