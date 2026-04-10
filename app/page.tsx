import Link from "next/link";
import { GradientCard } from "@/components/GradientCard";
import { BLOG_CATEGORY_ORDER, getCategoryLabel } from "@/lib/posts";

export default function Home() {
  return (
    <div className="space-y-10">
      <GradientCard className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
            Xin chào / Hello · TP. HCM
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Analytics · Data platform · Credit-risk ML · GenAI
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            <strong className="text-zinc-800 dark:text-zinc-200">VI:</strong> Mình là{" "}
            <strong>Trần Quốc Việt</strong> — làm nền dữ liệu (Airflow, dbt, BigQuery,
            GCP), mô hình rủi ro tín dụng bán lẻ (OOT, drift, scorecard / boosting), và
            GenAI có thể vận hành (RAG, agent, observability). Trang này tổng hợp giới
            thiệu và blog ghi chép kỹ thuật theo bốn chuyên mục.
          </p>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            <strong className="text-zinc-800 dark:text-zinc-200">EN:</strong> I&apos;m{" "}
            <strong>Tran Quoc Viet (Charlie)</strong> — I work on data platforms (Airflow,
            dbt, BigQuery, GCP), retail credit-risk ML (OOT, drift, scorecards /
            boosting), and production-minded GenAI (RAG, agents, observability). This site
            is my bio plus technical notes organized in four topics.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/about/"
            className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition hover:from-sky-500 hover:to-indigo-500 dark:shadow-indigo-500/20"
          >
            About / Giới thiệu
          </Link>
          <Link
            href="/blog/"
            className="rounded-xl border-2 border-transparent bg-gradient-to-r from-sky-500 to-indigo-500 p-[2px] text-sm font-semibold text-zinc-900 dark:text-zinc-100"
          >
            <span className="flex h-full w-full items-center justify-center rounded-[10px] bg-white px-4 py-2 dark:bg-zinc-950">
              Blog
            </span>
          </Link>
        </div>
      </GradientCard>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Blog theo mục / Topics
        </h2>
        <div className="flex flex-wrap gap-2">
          {BLOG_CATEGORY_ORDER.map((cat) => (
            <Link
              key={cat}
              href={`/blog/#${cat}`}
              className="rounded-full border border-sky-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-sky-800 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 dark:border-sky-500/30 dark:bg-zinc-900/60 dark:text-sky-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
            >
              {getCategoryLabel(cat)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
