"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LANG_KEY = "about-lang";
type Lang = "vi" | "en";

/* ── Shared data (language-agnostic) ──────────────────────────────────────── */

const SKILL_GROUPS_VI = [
  {
    cat: "Credit Scoring",
    badges: ["AutoML Pipeline", "Feature Engineering", "Scorecard", "OOT / Stability", "Alternative Data"],
  },
  {
    cat: "Data Platform",
    badges: ["Airflow", "dbt", "BigQuery", "Kafka", "Doris", "MongoDB"],
  },
  {
    cat: "ML Platform",
    badges: ["FeatureStore (Feast)", "MLOps", "DAG Orchestration", "Production Scoring"],
  },
  {
    cat: "GenAI & Agent",
    badges: ["Hybrid RAG", "Multi-agent", "Function Calling", "Eval & Tracing", "Vertex AI"],
  },
  {
    cat: "Cloud & BI",
    badges: ["GCP", "Looker Studio", "Superset"],
  },
];

const SKILL_GROUPS_EN = [
  {
    cat: "Credit Scoring",
    badges: ["AutoML Pipeline", "Feature Engineering", "Scorecard", "OOT / Stability", "Alternative Data"],
  },
  {
    cat: "Data Platform",
    badges: ["Airflow", "dbt", "BigQuery", "Kafka", "Doris", "MongoDB"],
  },
  {
    cat: "ML Platform",
    badges: ["FeatureStore (Feast)", "MLOps", "DAG Orchestration", "Production Scoring"],
  },
  {
    cat: "GenAI & Agents",
    badges: ["Hybrid RAG", "Multi-agent", "Function Calling", "Eval & Tracing", "Vertex AI"],
  },
  {
    cat: "Cloud & BI",
    badges: ["GCP", "Looker Studio", "Superset"],
  },
];

/* ── Sub-components ───────────────────────────────────────────────────────── */

function LangToggle({ lang, setLanguage }: { lang: Lang; setLanguage: (l: Lang) => void }) {
  return (
    <div
      className="mb-8 flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Chọn ngôn ngữ / Language"
    >
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--foreground-secondary)" }}>
        Language:
      </span>
      <div
        className="inline-flex rounded-lg p-0.5"
        style={{ border: "1px solid var(--border-warm)", background: "var(--surface-300)" }}
      >
        {(["vi", "en"] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLanguage(l)}
            className="rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition"
            style={
              lang === l
                ? { background: "var(--brand-from)", color: "#fff" }
                : { color: "var(--foreground-secondary)" }
            }
          >
            {l === "vi" ? "Tiếng Việt" : "English"}
          </button>
        ))}
      </div>
    </div>
  );
}

function NowCard({ vi }: { vi: boolean }) {
  return (
    <div className="about-now-card mb-8">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
          style={{ background: "var(--brand-from)" }}
        >
          {vi ? "Hiện tại" : "Now"}
        </span>
        <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          Data Scientist · Cake by VPBank
        </span>
        <span className="text-xs" style={{ color: "var(--foreground-secondary)" }}>
          {vi ? "T12/2025 — nay" : "Dec 2025 — present"}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["CakeAutoML", "ML Workflow", vi ? "Alternative Credit Scoring" : "Alt. Credit Scoring", "Embedded Finance"].map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
            style={{
              background: "color-mix(in srgb, var(--brand-from) 12%, transparent)",
              color: "var(--brand-from)",
              border: "1px solid color-mix(in srgb, var(--brand-from) 25%, transparent)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatsStrip({ vi }: { vi: boolean }) {
  const stats = vi
    ? [
        { label: "Kinh nghiệm", value: "3+ năm" },
        { label: "Role hiện tại", value: "Data Scientist" },
        { label: "Công ty", value: "Cake by VPBank" },
        { label: "Vị trí", value: "TP. HCM" },
      ]
    : [
        { label: "Experience", value: "3+ years" },
        { label: "Current role", value: "Data Scientist" },
        { label: "Company", value: "Cake by VPBank" },
        { label: "Location", value: "HCMC, Vietnam" },
      ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="stat-card pl-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-secondary)" }}>
            {s.label}
          </p>
          <p className="mt-0.5 font-heading text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function SkillsSection({ vi }: { vi: boolean }) {
  const groups = vi ? SKILL_GROUPS_VI : SKILL_GROUPS_EN;
  return (
    <section className="mb-8">
      <p className="about-section-title">{vi ? "Trọng tâm kỹ thuật" : "Technical focus"}</p>
      <div style={{ border: "1px solid var(--border-warm)", borderRadius: "0.75rem", overflow: "hidden" }}>
        {groups.map((g) => (
          <div key={g.cat} className="cv-skill-row" style={{ padding: "0.65rem 1rem" }}>
            <span className="cv-skill-cat">{g.cat}</span>
            <div className="cv-skill-badges">
              {g.badges.map((b) => (
                <span key={b} className="cv-skill-badge">{b}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */

export function AboutBody() {
  const [lang, setLang] = useState<Lang>("vi");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "vi") setLang(stored);
    } catch { /* ignore */ }
  }, []);

  const setLanguage = (next: Lang) => {
    setLang(next);
    try { localStorage.setItem(LANG_KEY, next); } catch { /* ignore */ }
  };

  return (
    <div style={{ maxWidth: "720px" }}>
      {/* ── Name / title header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            Trần Quốc Việt
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--foreground-secondary)" }}>
            Data Scientist · Credit Scoring &amp; ML · TP. Hồ Chí Minh
          </p>
        </div>
        <div className="flex gap-3 text-sm font-medium">
          <a href="https://github.com/charlieviettq" target="_blank" rel="noopener noreferrer"
            className="transition hover:opacity-70" style={{ color: "var(--brand-from)" }}>
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/aivietqt/" target="_blank" rel="noopener noreferrer"
            className="transition hover:opacity-70" style={{ color: "var(--brand-from)" }}>
            LinkedIn
          </a>
        </div>
      </div>

      <LangToggle lang={lang} setLanguage={setLanguage} />
      <NowCard vi={lang === "vi"} />
      <StatsStrip vi={lang === "vi"} />

      {lang === "vi" ? <ContentVi /> : <ContentEn />}
    </div>
  );
}

/* ── Vietnamese content ───────────────────────────────────────────────────── */

function ContentVi() {
  return (
    <>
      {/* Intro */}
      <section className="mb-8">
        <p className="about-section-title">Giới thiệu</p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--foreground)" }}>
          Ba năm trước mình đang build mô hình kiểm duyệt nội dung cho một mạng xã hội du lịch.
          Bây giờ mình đang tự động hoá quyết định tín dụng tại một digital bank. Ở giữa là: data
          pipeline, feature store, hệ thống chat agent đa tầng, và không ít đêm debug model tới sáng.
        </p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--foreground)" }}>
          Mình thích những bài toán mà <strong>data lộn xộn, hậu quả có thật</strong>, và không có
          benchmark sạch nào để núp vào.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
          Hiện tại mình đang build <strong>CakeAutoML</strong> — hệ thống tự động hoá toàn bộ quy
          trình từ chuẩn bị nhãn đến model tín dụng đã được validate — và nghiên cứu xem{" "}
          <strong>lịch sử giao dịch &amp; hành vi ứng dụng</strong> có thể chấm điểm tín dụng cho
          những người mà credit bureau truyền thống chưa từng &ldquo;thấy&rdquo;. Điểm giao nhau của{" "}
          <strong>alternative data</strong>, <strong>embedded finance</strong> và{" "}
          <strong>ML production</strong> là chỗ mình muốn dành thời gian.
        </p>
        <p className="mt-3 text-xs" style={{ color: "var(--foreground-secondary)" }}>
          Nội dung trang là mô tả năng lực cá nhân; không phải thông tin chính thức của tổ chức hay lời khuyên đầu tư.
        </p>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <p className="about-section-title">Kinh nghiệm</p>

        {/* Cake */}
        <div className="mb-6">
          <p className="text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>
            Cake by VPBank — Digital Bank
          </p>
          <div className="cv-timeline">

            {/* Data Scientist */}
            <div className="cv-role">
              <span className="cv-dot current" style={{ left: "-1.25rem" }} />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2">
                <span className="text-sm font-semibold" style={{ color: "var(--brand-from)" }}>
                  Data Scientist
                </span>
                <span className="text-xs font-mono" style={{ color: "var(--foreground-secondary)" }}>
                  T12/2025 — nay
                </span>
              </div>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Xây dựng <strong>CakeAutoML</strong> — tự động hoá toàn bộ pipeline credit scoring:{" "}
                  <span style={{ color: "var(--foreground-secondary)" }}>
                    Label Preparation → Data Preparation → Feature Selection → Training → Validator
                  </span>.
                </li>
                <li className="leading-relaxed">
                  Đóng góp vào <strong>ML workflow</strong>: orchestration DAG, chuẩn hoá quy trình training
                  và deployment cho nhóm Data Science.
                </li>
                <li className="leading-relaxed">
                  Nghiên cứu &amp; triển khai <strong>Alternative Credit Scoring</strong> từ tín hiệu{" "}
                  <em>transaction behaviour</em> + <em>app usage</em> — phục vụ chấm điểm tín dụng cho
                  sản phẩm <strong>Embedded Finance</strong>.
                </li>
              </ul>
            </div>

            {/* Data AI Engineer */}
            <div className="cv-role">
              <span className="cv-dot" style={{ left: "-1.25rem" }} />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2">
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Data AI Engineer
                </span>
                <span className="text-xs font-mono" style={{ color: "var(--foreground-secondary)" }}>
                  T7/2023 — T11/2025
                </span>
              </div>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Dẫn triển khai end-to-end <strong>hệ chat agent</strong> kiến trúc{" "}
                  <strong>multi-agent</strong> (supervisor) với <strong>hybrid RAG</strong>, function
                  calling và GenAI — eval, tracing, logging, orchestration; ~<strong>80% tự động hoá</strong>.
                </li>
                <li className="leading-relaxed">
                  <strong>Data Modeling</strong>: BigQuery &amp; Doris (Conversation Insight, Callbot,
                  Feature Store); BI qua Looker Studio &amp; Superset.
                </li>
                <li className="leading-relaxed">
                  <strong>Data Pipeline</strong> batch &amp; streaming: Airflow, dbt (SQL/Python), Kafka;
                  dashboard giám sát vận hành &amp; chi phí.
                </li>
                <li className="leading-relaxed">
                  Build nền tảng <strong>ML Platform</strong>: FeatureStore (Feast), MLOps, feature
                  engineering, scoring production (NTB/ETB).
                </li>
                <li className="leading-relaxed">
                  <strong>Auto EDA</strong> agent (MCP/DataHub style); <strong>CMS</strong> tự động phân
                  tích case (~70%).
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Hahalolo */}
        <div>
          <p className="text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>
            Hahalolo Travel Social Network
          </p>
          <div className="cv-timeline">
            <div className="cv-role">
              <span className="cv-dot" style={{ left: "-1.25rem" }} />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2">
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  AI Engineer
                </span>
                <span className="text-xs font-mono" style={{ color: "var(--foreground-secondary)" }}>
                  T3/2022 — T7/2023
                </span>
              </div>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Xây <strong>data warehouse</strong> MongoDB; pipeline batch, real-time &amp; lambda.
                </li>
                <li className="leading-relaxed">
                  <strong>Kiểm duyệt nội dung</strong>: fine-tune PhoBERT, bán tự động phát hiện vi phạm
                  &amp; xếp hạng mức độ cho reviewer.
                </li>
                <li className="leading-relaxed">
                  <strong>Gợi ý tour &amp; bạn bè</strong> dùng graph embedding; phối hợp backend/QC.
                </li>
                <li className="leading-relaxed text-xs" style={{ color: "var(--foreground-secondary)" }}>
                  Stack: Python · Airflow · Kafka · MongoDB · PyTorch · TensorFlow · Jenkins
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <SkillsSection vi={true} />

      {/* Education */}
      <section className="mb-8">
        <p className="about-section-title">Học vấn &amp; ghi nhận</p>
        <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Đại học FPT</p>
            <p className="text-xs" style={{ color: "var(--foreground-secondary)" }}>
              Cử nhân Trí tuệ nhân tạo · 10/2019 — 10/2023 · Xếp loại Very Good
            </p>
          </div>
        </div>
        <ul className="mt-3 space-y-1">
          {[
            "Học bổng 100% Đại học FPT",
            "Học bổng 100%++ tập đoàn FPT cho tỉnh Bình Định",
            "Top 10 học sinh tỉnh Bình Định (bậc phổ thông)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "var(--foreground)" }}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--brand-from)" }} />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Certs */}
      <section className="mb-8">
        <p className="about-section-title">Chứng chỉ</p>
        <ul className="space-y-2">
          {[
            { name: "Natural Language Processing", org: "DeepLearning.AI", date: "6/2023" },
            { name: "Fundamentals of Machine Learning in Finance", org: "NYU Tandon", date: "6/2023" },
          ].map((c) => (
            <li key={c.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{c.name}</span>
              <span className="text-xs" style={{ color: "var(--foreground-secondary)" }}>
                {c.org} · {c.date}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/* ── English content ──────────────────────────────────────────────────────── */

function ContentEn() {
  return (
    <>
      {/* Intro */}
      <section className="mb-8">
        <p className="about-section-title">About</p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--foreground)" }}>
          Three years ago I was building content moderation models at a travel startup. Today
          I&apos;m automating credit decisions at a digital bank. In between: data pipelines,
          feature stores, multi-agent chat systems, and more than a few sleepless model
          debugging sessions.
        </p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--foreground)" }}>
          I like problems where <strong>data is messy, stakes are real</strong>, and there&apos;s
          no clean benchmark to hide behind.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
          Right now I&apos;m building <strong>CakeAutoML</strong> — an end-to-end system that
          takes raw data all the way from label preparation to a validated credit model — and
          researching whether <strong>transaction history &amp; app behaviour</strong> can score
          credit for people traditional bureaus have never seen. The intersection of{" "}
          <strong>alternative data</strong>, <strong>embedded finance</strong>, and{" "}
          <strong>production ML</strong> is where I want to spend my time.
        </p>
        <p className="mt-3 text-xs" style={{ color: "var(--foreground-secondary)" }}>
          This page describes my own skills and experience; not an official statement by any employer and not investment advice.
        </p>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <p className="about-section-title">Experience</p>

        {/* Cake */}
        <div className="mb-6">
          <p className="text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>
            Cake by VPBank — Digital Bank
          </p>
          <div className="cv-timeline">

            {/* Data Scientist */}
            <div className="cv-role">
              <span className="cv-dot current" style={{ left: "-1.25rem" }} />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2">
                <span className="text-sm font-semibold" style={{ color: "var(--brand-from)" }}>
                  Data Scientist
                </span>
                <span className="text-xs font-mono" style={{ color: "var(--foreground-secondary)" }}>
                  Dec 2025 — present
                </span>
              </div>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Building <strong>CakeAutoML</strong> — end-to-end automated credit scoring pipeline:{" "}
                  <span style={{ color: "var(--foreground-secondary)" }}>
                    Label Preparation → Data Preparation → Feature Selection → Training → Validator
                  </span>.
                </li>
                <li className="leading-relaxed">
                  Contributing to the <strong>ML workflow</strong>: DAG orchestration, standardising
                  training and deployment processes for the Data Science team.
                </li>
                <li className="leading-relaxed">
                  Researching &amp; implementing <strong>Alternative Credit Scoring</strong> using{" "}
                  <em>transaction behaviour</em> + <em>app-usage</em> signals — enabling credit
                  assessment for <strong>Embedded Finance</strong> products.
                </li>
              </ul>
            </div>

            {/* Data AI Engineer */}
            <div className="cv-role">
              <span className="cv-dot" style={{ left: "-1.25rem" }} />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2">
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Data AI Engineer
                </span>
                <span className="text-xs font-mono" style={{ color: "var(--foreground-secondary)" }}>
                  Jul 2023 — Nov 2025
                </span>
              </div>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Led end-to-end <strong>multi-agent chat system</strong> (supervisor architecture)
                  with <strong>hybrid RAG</strong>, function calling, GenAI — eval, tracing, logging,
                  action orchestration; ~<strong>80% automated support</strong>.
                </li>
                <li className="leading-relaxed">
                  <strong>Data Modeling</strong>: BigQuery &amp; Doris (Conversation Insight, Callbot,
                  Feature Store); BI via Looker Studio &amp; Superset.
                </li>
                <li className="leading-relaxed">
                  Batch &amp; streaming <strong>Data Pipelines</strong>: Airflow, dbt (SQL/Python),
                  Kafka; operational and cost monitoring dashboards.
                </li>
                <li className="leading-relaxed">
                  <strong>ML Platform</strong> foundations: FeatureStore (Feast), MLOps, feature
                  engineering, production scoring (NTB/ETB).
                </li>
                <li className="leading-relaxed">
                  <strong>Auto EDA</strong> agent (MCP/DataHub-style); <strong>CMS</strong> automation
                  with ~70% automated case parsing.
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Hahalolo */}
        <div>
          <p className="text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>
            Hahalolo Travel Social Network
          </p>
          <div className="cv-timeline">
            <div className="cv-role">
              <span className="cv-dot" style={{ left: "-1.25rem" }} />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2">
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  AI Engineer
                </span>
                <span className="text-xs font-mono" style={{ color: "var(--foreground-secondary)" }}>
                  Mar 2022 — Jul 2023
                </span>
              </div>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Built <strong>data warehouse</strong> on MongoDB; batch, real-time &amp; lambda pipelines.
                </li>
                <li className="leading-relaxed">
                  <strong>Content moderation</strong>: PhoBERT fine-tuning for semi-automated violation
                  detection and severity ranking.
                </li>
                <li className="leading-relaxed">
                  <strong>Tour &amp; friend recommendations</strong> via graph embedding; backend/QC collaboration.
                </li>
                <li className="leading-relaxed text-xs" style={{ color: "var(--foreground-secondary)" }}>
                  Stack: Python · Airflow · Kafka · MongoDB · PyTorch · TensorFlow · Jenkins
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <SkillsSection vi={false} />

      {/* Education */}
      <section className="mb-8">
        <p className="about-section-title">Education &amp; recognition</p>
        <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>FPT University</p>
            <p className="text-xs" style={{ color: "var(--foreground-secondary)" }}>
              Bachelor&apos;s in Artificial Intelligence · Oct 2019 — Oct 2023 · Very Good
            </p>
          </div>
        </div>
        <ul className="mt-3 space-y-1">
          {[
            "100% scholarship at FPT University",
            "100%++ FPT Corporation scholarship for Binh Dinh province",
            "Top 10 scholarships of Binh Dinh province (secondary level)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "var(--foreground)" }}>
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--brand-from)" }} />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Certs */}
      <section className="mb-8">
        <p className="about-section-title">Certifications</p>
        <ul className="space-y-2">
          {[
            { name: "Natural Language Processing", org: "DeepLearning.AI", date: "Jun 2023" },
            { name: "Fundamentals of Machine Learning in Finance", org: "NYU Tandon", date: "Jun 2023" },
          ].map((c) => (
            <li key={c.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{c.name}</span>
              <span className="text-xs" style={{ color: "var(--foreground-secondary)" }}>
                {c.org} · {c.date}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
