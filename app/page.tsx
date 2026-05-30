import Link from "next/link";

import { CharlieLogoSVG } from "@/components/CharlieLogoSVG";
import { ConstellationBg } from "@/components/ConstellationBg";
import { getCategoryLabel, getCategoryPillClasses } from "@/lib/category";
import { getAllPosts } from "@/lib/posts";

const expertise = [
  {
    label: "Credit Risk ML",
    title: "Credit decisions that survive production.",
    body: "Label windows, OOT validation, drift checks, scorecards, boosting, and model monitoring for retail credit.",
  },
  {
    label: "Data Platform",
    title: "Pipelines built for repeatable analytics.",
    body: "Airflow, dbt, BigQuery, GCP, feature stores, and BI models that keep ML and operations aligned.",
  },
  {
    label: "GenAI Systems",
    title: "RAG and agents with operational discipline.",
    body: "Hybrid retrieval, function calling, evaluation loops, tracing, and production-minded automation.",
  },
  {
    label: "MLOps",
    title: "From experiments to governed workflows.",
    body: "Training orchestration, validators, deployment handoffs, and monitoring paths for high-stakes models.",
  },
];

const buildItems = [
  "CakeAutoML for end-to-end credit scoring workflows",
  "Alternative credit signals from transaction and app behavior",
  "Feature store and production scoring patterns",
  "Multi-agent customer support automation with hybrid RAG",
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
            I build data and ML systems for credit, banking, and production AI.
          </h1>
          <p
            className="mt-6 max-w-2xl text-base leading-8 sm:text-lg"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Data Scientist focused on credit-risk ML, data platforms, and GenAI systems
            that are measurable, auditable, and useful beyond notebooks.
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
              ["Focus", "Credit Risk ML"],
              ["Platform", "GCP · BigQuery"],
              ["Stack", "Airflow · dbt · RAG"],
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
              Technical notes on data, ML, and credit systems.
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--foreground-secondary)" }}>
              Written in Vietnamese and English for practitioners who care about the
              operational details.
            </p>
          </div>
        </aside>
      </section>

      <section className="page-band">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="section-header">
            <p className="eyebrow">Expertise</p>
            <h2>Systems thinking across the credit ML stack.</h2>
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
          <p className="eyebrow">What I build</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-balance sm:text-4xl">
            Practical systems where messy data meets real decisions.
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
              <h2>Technical notes from the field.</h2>
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
