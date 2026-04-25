import Link from "next/link";
import { GradientCard } from "@/components/GradientCard";
import {
  BLOG_CATEGORY_ORDER,
  getCategoryLabel,
  getCategoryPillClasses,
} from "@/lib/posts";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
    <div className="space-y-10">
      {/* ── Hero card ──────────────────────────────────────────────────────── */}
      <GradientCard className="space-y-6">
        <div className="space-y-5">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--brand-from)" }}
          >
            Xin chào / Hello · TP. HCM
          </p>
          <h1
            className="font-heading text-4xl font-bold sm:text-5xl"
            style={{ letterSpacing: "-0.035em", lineHeight: 1.1 }}
          >
            Analytics · Data platform · Credit-risk ML · GenAI
          </h1>
          <p
            className="max-w-2xl text-base leading-relaxed"
            style={{ color: "var(--foreground-secondary)" }}
          >
            <strong style={{ color: "var(--foreground)" }}>VI:</strong> Mình là{" "}
            <strong style={{ color: "var(--foreground)" }}>Trần Quốc Việt</strong> — làm nền dữ liệu (Airflow, dbt, BigQuery,
            GCP), mô hình rủi ro tín dụng bán lẻ (OOT, drift, scorecard / boosting), và
            GenAI có thể vận hành (RAG, agent, observability). Trang này tổng hợp giới
            thiệu và blog ghi chép kỹ thuật theo bốn chuyên mục.
          </p>
          <p
            className="max-w-2xl text-base leading-relaxed"
            style={{ color: "var(--foreground-secondary)" }}
          >
            <strong style={{ color: "var(--foreground)" }}>EN:</strong> I&apos;m{" "}
            <strong style={{ color: "var(--foreground)" }}>Tran Quoc Viet (Charlie)</strong> — I work on data platforms (Airflow,
            dbt, BigQuery, GCP), retail credit-risk ML (OOT, drift, scorecards /
            boosting), and production-minded GenAI (RAG, agents, observability). This site
            is my bio plus technical notes organized in four topics.
          </p>
        </div>

        {/* ── Stat strip ─────────────────────────────────────────────────── */}
        <div
          className="grid grid-cols-2 gap-3 pt-5 sm:grid-cols-4"
          style={{ borderTop: "1px solid var(--border-warm)" }}
        >
          {[
            { label: "Focus Domain", value: "Credit Risk ML" },
            { label: "Platform", value: "GCP · BigQuery" },
            { label: "Stack", value: "Airflow · dbt · RAG" },
            { label: "Location", value: "HCMC, Vietnam" },
          ].map((s) => (
            <div key={s.label} className="stat-card pl-3">
              <p
                className="text-[0.65rem] font-semibold uppercase tracking-wider"
                style={{ color: "var(--foreground-secondary)" }}
              >
                {s.label}
              </p>
              <p className="mt-0.5 font-heading text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── CTA buttons ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/about/"
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: "var(--brand-from)" }}
          >
            About / Giới thiệu
          </Link>
          <Link
            href="/blog/"
            className="rounded-lg px-5 py-2.5 text-sm font-semibold transition hover:opacity-80"
            style={{
              backgroundColor: "var(--surface-300)",
              border: "1px solid var(--border-warm)",
              color: "var(--foreground)",
            }}
          >
            Blog →
          </Link>
        </div>
      </GradientCard>

      {/* ── Category pills ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2
          className="font-heading text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--foreground-secondary)" }}
        >
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
    </div>
  );
}
