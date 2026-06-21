import Link from "next/link";

import { CharlieLogoSVG } from "@/components/CharlieLogoSVG";
import { ConstellationBg } from "@/components/ConstellationBg";
import { getCategoryLabel, getCategoryPillClasses } from "@/lib/category";
import { getAllPosts } from "@/lib/posts";

const expertise = [
  {
    label: "Credit Decision Science",
    title: "Turn risk signals into lending decisions.",
    body: "Application score, behavioral score, PD bands, cutoff, limits, pricing, and portfolio monitoring built around real risk-return trade-offs.",
  },
  {
    label: "GenAI & Agentic Systems",
    title: "Automate fintech workflows with governed AI.",
    body: "Hybrid RAG, multi-agent routing, customer support automation, analytics agents, evaluation, tracing, and human validation loops.",
  },
  {
    label: "Data & ML Platform",
    title: "Make models repeatable in production.",
    body: "Airflow, dbt, BigQuery, streaming, feature store patterns, production scoring, and AutoML workflows that teams can operate.",
  },
];

const buildItems = [
  "Credit scoring workflows from label preparation to OOT validation, calibration, and production scoring",
  "Decision simulations across approval, cutoff, limit, pricing, expected loss, and portfolio guardrails",
  "GenAI agents for customer support, case triage, analytics, retrieval, evaluation, and tracing",
  "Data and ML platform foundations with Airflow, dbt, BigQuery, Kafka, Doris, and feature stores",
];

export default function Home() {
  const posts = getAllPosts()
    .filter((p) => (p.frontMatter.visibility ?? "public") === "public")
    .slice(0, 3);

  return (
    <div className="relative overflow-hidden">
      <div className="home-constellation" aria-hidden>
        <ConstellationBg />
      </div>

      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-20">
        <div>
          <p className="eyebrow">Tran Quoc Viet / Charlie · HCMC</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
            I build AI/ML systems for fintech decisions.
          </h1>
          <p
            className="mt-6 max-w-2xl text-base leading-8 sm:text-lg"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Data Scientist focused on credit decisioning, GenAI agents, and ML platforms: turning messy banking data into scoring, automation, monitoring, and production decision systems.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link className="btn-primary" href="/about/">
              About / Gioi thieu
            </Link>
            <Link className="btn-secondary" href="/blog/">
              Read blog
            </Link>
          </div>

          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Focus", "Fintech AI/ML"],
              ["Depth", "Credit decisioning"],
              ["Systems", "Agents · Platform · Scoring"],
              ["Base", "HCMC, Vietnam"],
            ].map(([label, value]) => (
              <div key={label} className="metric-card">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="hero-brand-panel" aria-label="Personal brand mark">
          <CharlieLogoSVG size={190} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Notes on fintech AI systems and business impact.
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--foreground-secondary)" }}>
              Written in Vietnamese and English, focused on credit scoring, GenAI agents, model validation, monitoring, and how to ship systems that hold up in real operations.
            </p>
          </div>
        </aside>
      </section>

      <section className="page-band">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="section-header">
            <p className="eyebrow">Expertise</p>
            <h2>Data science for fintech systems.</h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {expertise.map((item) => (
              <article key={item.label} className="editorial-panel">
                <p className="panel-label">{item.label}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">What I optimize</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-balance sm:text-4xl">
            Where messy banking data becomes reliable AI products.
          </h2>
        </div>
        <div className="build-list">
          {buildItems.map((item, index) => (
            <div key={item} className="build-row">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-band">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="section-header section-header-row">
            <div>
              <p className="eyebrow">Latest writing</p>
              <h2>Notes on credit risk, decisioning, and production AI.</h2>
            </div>
            <Link className="text-link" href="/blog/">
              View all posts
            </Link>
          </div>

          <div className="mt-8 divide-y divide-[var(--border-warm)] border-y border-[var(--border-warm)]">
            {posts.map((post) => {
              const category = post.frontMatter.category ?? "banking";
              return (
                <article key={post.slug} className="post-preview-row">
                  <div className="post-preview-meta">
                    <span className={getCategoryPillClasses(category)}>
                      {getCategoryLabel(category)}
                    </span>
                    <time>{post.frontMatter.date}</time>
                  </div>
                  <div className="min-w-0">
                    <Link href={`/blog/${post.slug}/`} className="post-preview-title">
                      {post.frontMatter.title}
                    </Link>
                    {post.frontMatter.excerpt ? (
                      <p className="post-preview-excerpt">{post.frontMatter.excerpt}</p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
