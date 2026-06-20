import Link from "next/link";

import { CharlieLogoSVG } from "@/components/CharlieLogoSVG";
import { ConstellationBg } from "@/components/ConstellationBg";
import { getCategoryLabel, getCategoryPillClasses } from "@/lib/category";
import { getAllPosts } from "@/lib/posts";

const expertise = [
  {
    label: "Decision Science",
    title: "Optimize approvals with controlled risk.",
    body: "Decision policies, thresholding, and experiment-ready analytics that connect model signals to approval and portfolio outcomes.",
  },
  {
    label: "Portfolio Optimization",
    title: "Limits and pricing that balance risk-return.",
    body: "Risk curves, segments, and constraints to improve growth while keeping bad-rate and loss targets measurable and stable.",
  },
  {
    label: "Model Risk & Validation",
    title: "Models you can trust beyond a single split.",
    body: "Label windows, OOT validation, calibration, stability checks, and drift monitoring tied to real portfolio KPIs.",
  },
  {
    label: "Repeatable Decisioning",
    title: "From messy data to governed decisions.",
    body: "Practical DS systems that make scoring, monitoring, and iterative policy improvements repeatable across teams.",
  },
];

const buildItems = [
  "Approval vs risk trade-offs with policy simulation and guardrails",
  "Credit limits and pricing strategies using risk-return curves",
  "Early warning and drift monitoring tied to portfolio KPIs",
  "Alternative signals from transaction and app behavior for thin-file segments",
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
            I optimize credit decisions with data science.
          </h1>
          <p
            className="mt-6 max-w-2xl text-base leading-8 sm:text-lg"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Data Scientist working on decisioning and portfolio optimization: turning risk signals into measurable outcomes across approval, limits, pricing, and monitoring.
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
              ["Focus", "Credit decisioning"],
              ["Impact", "Risk-return"],
              ["Levers", "Approval · Limit · Pricing"],
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
              Notes on credit analytics and business impact.
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--foreground-secondary)" }}>
              Written in Vietnamese and English, focused on validation, calibration, monitoring, and how to ship decisions that hold up in real portfolios.
            </p>
          </div>
        </aside>
      </section>

      <section className="page-band">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="section-header">
            <p className="eyebrow">Expertise</p>
            <h2>Data science for credit outcomes.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
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
            Where messy data becomes measurable decisions.
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
              <h2>Notes on credit data science and decisions.</h2>
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
