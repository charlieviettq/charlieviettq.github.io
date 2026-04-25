import Link from "next/link";
import { GradientCard } from "@/components/GradientCard";
import {
  BLOG_CATEGORY_ORDER,
  getCategoryLabel,
  getCategoryPillClasses,
} from "@/lib/posts";

export default function Home() {
  return (
    <div className="space-y-10">
      {/* ── Hero card ──────────────────────────────────────────────────────── */}
      <GradientCard className="space-y-6 border-t-2 border-t-amber-400/70">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Xin chào / Hello · TP. HCM
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Analytics · Data platform · Credit-risk ML · GenAI
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            <strong className="text-zinc-800 dark:text-zinc-200">VI:</strong> Mình là{" "}
            <strong>Trần Quốc Việt</strong> — làm nền dữ liệu (Airflow, dbt, BigQuery,
            GCP), mô hình rủi ro tín dụng bán lẻ (OOT, drift, scorecard / boosting), và
            GenAI có thể vận hành (RAG, agent, observability). Trang này tổng hợp giới
            thiệu và blog ghi chép kỹ thuật theo bốn chuyên mục.
          </p>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            <strong className="text-zinc-800 dark:text-zinc-200">EN:</strong> I&apos;m{" "}
            <strong>Tran Quoc Viet (Charlie)</strong> — I work on data platforms (Airflow,
            dbt, BigQuery, GCP), retail credit-risk ML (OOT, drift, scorecards /
            boosting), and production-minded GenAI (RAG, agents, observability). This site
            is my bio plus technical notes organized in four topics.
          </p>
        </div>

        {/* ── Stat strip ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-200/60 pt-5 sm:grid-cols-4 dark:border-zinc-700/40">
          {[
            { label: "Focus Domain", value: "Credit Risk ML" },
            { label: "Platform", value: "GCP · BigQuery" },
            { label: "Stack", value: "Airflow · dbt · RAG" },
            { label: "Location", value: "HCMC, Vietnam" },
          ].map((s) => (
            <div key={s.label} className="stat-card pl-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {s.label}
              </p>
              <p className="mt-0.5 font-heading text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── CTA buttons ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/about/"
            className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-amber-500/20 transition hover:bg-amber-500"
          >
            About / Giới thiệu
          </Link>
          <Link
            href="/blog/"
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-amber-300/60 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-amber-500/30"
          >
            Blog →
          </Link>
        </div>
      </GradientCard>

      {/* ── Category pills ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Blog theo mục / Topics
        </h2>
        <div className="flex flex-wrap gap-2">
          {BLOG_CATEGORY_ORDER.map((cat) => (
            <Link
              key={cat}
              href={`/blog/#${cat}`}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm transition hover:opacity-90 ${getCategoryPillClasses(cat)}`}
            >
              {getCategoryLabel(cat)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
