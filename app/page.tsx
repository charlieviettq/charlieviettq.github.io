import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
          Xin chào / Hello
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Data &middot; ML &middot; GenAI engineer
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          <strong className="text-zinc-800 dark:text-zinc-200">VI:</strong> Trang
          cá nhân để chia sẻ giới thiệu, liên kết và blog ngắn về data platform,
          risk/ML, và agentic AI.
        </p>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          <strong className="text-zinc-800 dark:text-zinc-200">EN:</strong> A small
          personal site for bio, links, and notes on data platforms, credit-risk ML,
          and GenAI agents.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/about/"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          About / Giới thiệu
        </Link>
        <Link
          href="/blog/"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500"
        >
          Blog
        </Link>
      </div>
    </div>
  );
}
