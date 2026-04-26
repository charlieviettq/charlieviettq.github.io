"use client";

import { useEffect, useState } from "react";

const LANG_KEY = "about-lang";
type Lang = "vi" | "en";

/* ── Tech icon map — simple-icons CDN slugs ───────────────────────────────── */

const ICON_MAP: Record<string, string> = {
  "Python":          "python",
  "PyTorch":         "pytorch",
  "TensorFlow":      "tensorflow",
  "MongoDB":         "mongodb",
  "Airflow":         "apacheairflow",
  "Kafka":           "apachekafka",
  "dbt":             "dbt",
  "GCP":             "googlecloud",
  "BigQuery":        "googlebigquery",
  "Vertex AI":       "googlecloud",
  "Looker Studio":   "looker",
  "LangChain":       "langchain",
  "scikit-learn":    "scikitlearn",
  "Jenkins":         "jenkins",
  "Gemini / OpenAI": "openai",
  "Superset":        "apachesuperset",
  "Doris":           "apachedoris",
};

/* ── Per-role tech stacks ─────────────────────────────────────────────────── */

const TECH = {
  dataScientist: {
    key: ["Python", "LightGBM", "XGBoost", "BigQuery"],
    all: ["Python", "LightGBM", "XGBoost", "scikit-learn", "BigQuery", "Airflow", "dbt", "GCP"],
  },
  dataAIEngineer: {
    key: ["Python", "LangChain", "Vertex AI", "Airflow", "Feast"],
    all: ["Python", "LangChain", "Gemini / OpenAI", "Airflow", "dbt", "BigQuery", "Doris", "Kafka", "Feast", "GCP", "Vertex AI", "Looker Studio"],
  },
  hahalolo: {
    key: ["Python", "PyTorch", "PhoBERT"],
    all: ["Python", "PyTorch", "TensorFlow", "PhoBERT", "MongoDB", "Airflow", "Kafka", "Jenkins"],
  },
};

/* ── Shared skill groups ──────────────────────────────────────────────────── */

const SKILL_GROUPS_VI = [
  { cat: "Credit Scoring",  badges: ["AutoML Pipeline", "Feature Engineering", "Scorecard", "OOT / Stability", "Alternative Data"] },
  { cat: "Data Platform",   badges: ["Airflow", "dbt", "BigQuery", "Kafka", "Doris", "MongoDB"] },
  { cat: "ML Platform",     badges: ["FeatureStore (Feast)", "MLOps", "DAG Orchestration", "Production Scoring"] },
  { cat: "GenAI & Agent",   badges: ["Hybrid RAG", "Multi-agent", "Function Calling", "Eval & Tracing", "Vertex AI"] },
  { cat: "Cloud & BI",      badges: ["GCP", "Looker Studio", "Superset"] },
];

const SKILL_GROUPS_EN = [
  { cat: "Credit Scoring",  badges: ["AutoML Pipeline", "Feature Engineering", "Scorecard", "OOT / Stability", "Alternative Data"] },
  { cat: "Data Platform",   badges: ["Airflow", "dbt", "BigQuery", "Kafka", "Doris", "MongoDB"] },
  { cat: "ML Platform",     badges: ["FeatureStore (Feast)", "MLOps", "DAG Orchestration", "Production Scoring"] },
  { cat: "GenAI & Agents",  badges: ["Hybrid RAG", "Multi-agent", "Function Calling", "Eval & Tracing", "Vertex AI"] },
  { cat: "Cloud & BI",      badges: ["GCP", "Looker Studio", "Superset"] },
];

/* ── Sub-components ───────────────────────────────────────────────────────── */

function LangToggle({ lang, setLanguage }: { lang: Lang; setLanguage: (l: Lang) => void }) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label="Chọn ngôn ngữ / Language">
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--foreground-secondary)" }}>
        Language:
      </span>
      <div className="inline-flex rounded-lg p-0.5" style={{ border: "1px solid var(--border-warm)", background: "var(--surface-300)" }}>
        {(["vi", "en"] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLanguage(l)}
            className="rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition"
            style={lang === l ? { background: "var(--brand-from)", color: "#fff" } : { color: "var(--foreground-secondary)" }}
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
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white" style={{ background: "var(--brand-from)" }}>
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
          <span key={tag} className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold"
            style={{
              background: "color-mix(in srgb, var(--brand-from) 12%, transparent)",
              color: "var(--brand-from)",
              border: "1px solid color-mix(in srgb, var(--brand-from) 25%, transparent)",
            }}>
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
        { label: "Kinh nghiệm", value: "4+ năm" },
        { label: "Role hiện tại", value: "Data Scientist" },
        { label: "Công ty", value: "Cake by VPBank" },
        { label: "Vị trí", value: "TP. HCM" },
      ]
    : [
        { label: "Experience", value: "4+ years" },
        { label: "Current role", value: "Data Scientist" },
        { label: "Company", value: "Cake by VPBank" },
        { label: "Location", value: "HCMC, Vietnam" },
      ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="stat-card pl-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-secondary)" }}>{s.label}</p>
          <p className="mt-0.5 font-heading text-sm font-semibold" style={{ color: "var(--foreground)" }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function TechChips({ chips, keyChips }: { chips: string[]; keyChips: string[] }) {
  return (
    <div className="cv-tech-strip">
      {chips.map((chip) => {
        const isKey = keyChips.includes(chip);
        const slug = ICON_MAP[chip];
        return (
          <span key={chip} className={`cv-tech-chip${isKey ? " key" : ""}`}>
            {slug && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://cdn.simpleicons.org/${slug}`}
                alt=""
                aria-hidden="true"
                width={11}
                height={11}
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  marginRight: "0.3rem",
                  filter: isKey ? "none" : "grayscale(0.6) opacity(0.55)",
                }}
              />
            )}
            {chip}
          </span>
        );
      })}
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
          <div key={g.cat} className="cv-skill-row" style={{ padding: "0.6rem 0.875rem" }}>
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

function EducationSection({ vi }: { vi: boolean }) {
  const items = vi
    ? ["Học bổng 100% Đại học FPT", "Học bổng 100%++ tập đoàn FPT cho tỉnh Bình Định", "Top 10 học sinh tỉnh Bình Định (bậc phổ thông)"]
    : ["100% scholarship at FPT University", "100%++ FPT Corporation scholarship for Binh Dinh province", "Top 10 scholarships of Binh Dinh province (secondary level)"];

  return (
    <section className="mb-8">
      <p className="about-section-title">{vi ? "Học vấn & ghi nhận" : "Education & recognition"}</p>
      <div className="mb-2">
        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          {vi ? "Đại học FPT" : "FPT University"}
        </p>
        <p className="text-xs" style={{ color: "var(--foreground-secondary)" }}>
          {vi
            ? "Cử nhân Trí tuệ nhân tạo · 10/2019 — 10/2023 · Very Good"
            : "Bachelor's in Artificial Intelligence · Oct 2019 — Oct 2023 · Very Good"}
        </p>
      </div>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "var(--foreground)" }}>
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--brand-from)" }} />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CertsSection({ vi }: { vi: boolean }) {
  const certs = [
    { name: "Natural Language Processing", org: "DeepLearning.AI", date: vi ? "6/2023" : "Jun 2023" },
    { name: "Fundamentals of Machine Learning in Finance", org: "NYU Tandon", date: vi ? "6/2023" : "Jun 2023" },
  ];
  return (
    <section className="mb-8">
      <p className="about-section-title">{vi ? "Chứng chỉ" : "Certifications"}</p>
      <ul className="space-y-2">
        {certs.map((c) => (
          <li key={c.name} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{c.name}</span>
            <span className="text-xs" style={{ color: "var(--foreground-secondary)" }}>{c.org} · {c.date}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Experience sections ──────────────────────────────────────────────────── */

function ExperienceVi() {
  return (
    <section>
      <p className="about-section-title">Kinh nghiệm</p>

      {/* Cake */}
      <div className="mb-5">
        <div className="cv-company">
          <span className="cv-company-name">Cake by VPBank — Digital Bank</span>
          <span className="cv-company-line" />
        </div>
        <div className="cv-timeline">
          {/* Data Scientist */}
          <div className="cv-role">
            <span className="cv-dot current" />
            <div className="cv-role-card current">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2.5">
                <span className="text-sm font-semibold" style={{ color: "var(--brand-from)" }}>Data Scientist</span>
                <span className="text-xs font-mono" style={{ color: "var(--foreground-secondary)" }}>T12/2025 — nay</span>
              </div>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Xây dựng <strong>CakeAutoML</strong> — tự động hoá toàn bộ pipeline credit scoring:{" "}
                  <span style={{ color: "var(--foreground-secondary)" }}>Label Preparation → Data Preparation → Feature Selection → Training → Validator</span>{" "}
                  — đưa thời gian training end-to-end xuống <strong>dưới 60 phút</strong>.
                </li>
                <li className="leading-relaxed">
                  Đóng góp vào <strong>ML workflow</strong>: orchestration DAG, chuẩn hoá quy trình training và deployment.
                </li>
                <li className="leading-relaxed">
                  Nghiên cứu &amp; triển khai <strong>Alternative Credit Scoring</strong> từ tín hiệu{" "}
                  <em>transaction behaviour</em> + <em>app usage</em> cho sản phẩm <strong>Embedded Finance</strong>.
                </li>
              </ul>
              <TechChips chips={TECH.dataScientist.all} keyChips={TECH.dataScientist.key} />
            </div>
          </div>

          {/* Data AI Engineer */}
          <div className="cv-role">
            <span className="cv-dot" />
            <div className="cv-role-card">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1.5">
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Data AI Engineer</span>
                <span className="text-xs font-mono" style={{ color: "var(--foreground-secondary)" }}>T7/2023 — T11/2025</span>
              </div>
              <p className="text-xs mb-2.5 italic" style={{ color: "var(--foreground-secondary)" }}>
                PIC cho phần lớn các sản phẩm AI — điều phối trực tiếp với PM, Backend Engineers, CS &amp; Ops teams.
              </p>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Dẫn triển khai end-to-end <strong>hệ chat agent multi-agent</strong> (supervisor + hybrid RAG) —
                  automate <strong>70–80% lượt chat</strong> với <strong>90% chính xác</strong> (validated trên CS sample).
                </li>
                <li className="leading-relaxed">
                  <strong>CMS</strong>: tự động phân loại case &amp; triage email — workflow nhận request → phân loại → assign downstream;
                  giảm <strong>~70% thao tác thủ công</strong>.
                </li>
                <li className="leading-relaxed">
                  <strong>Data Modeling</strong>: BigQuery &amp; Doris (Conversation Insight, Callbot, Feature Store); BI qua Looker Studio &amp; Superset.
                </li>
                <li className="leading-relaxed">
                  <strong>Data Pipeline</strong> batch &amp; streaming: Airflow, dbt, Kafka.
                </li>
                <li className="leading-relaxed">
                  <strong>ML Platform</strong>: FeatureStore (Feast), MLOps, scoring production (NTB/ETB).
                </li>
                <li className="leading-relaxed"><strong>Auto EDA</strong> agent (MCP/DataHub style).</li>
              </ul>
              <TechChips chips={TECH.dataAIEngineer.all} keyChips={TECH.dataAIEngineer.key} />
            </div>
          </div>
        </div>
      </div>

      {/* Hahalolo */}
      <div>
        <div className="cv-company">
          <span className="cv-company-name">Hahalolo Travel Social Network</span>
          <span className="cv-company-line" />
        </div>
        <div className="cv-timeline">
          <div className="cv-role">
            <span className="cv-dot" />
            <div className="cv-role-card">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1.5">
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>AI Engineer</span>
                <span className="text-xs font-mono" style={{ color: "var(--foreground-secondary)" }}>T3/2022 — T7/2023</span>
              </div>
              <p className="text-xs mb-2.5 italic" style={{ color: "var(--foreground-secondary)" }}>
                Làm việc trực tiếp với CTO — xây dựng toàn bộ hệ thống Data &amp; AI từ raw log đến các sản phẩm AI production.
              </p>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Xây dựng <strong>data warehouse từ raw log</strong>: thiết kế mô hình dữ liệu (user, post, hashtag, tương tác, quan hệ),
                  pipeline batch, real-time &amp; lambda trên MongoDB.
                </li>
                <li className="leading-relaxed">
                  <strong>Hệ thống kiểm duyệt nội dung</strong>: fine-tune PhoBERT, bán tự động phát hiện vi phạm &amp; xếp hạng mức độ.
                </li>
                <li className="leading-relaxed">
                  <strong>Hệ thống gợi ý &amp; ranking</strong>: gợi ý kết bạn, ranking user &amp; hashtag dùng graph embedding.
                </li>
              </ul>
              <TechChips chips={TECH.hahalolo.all} keyChips={TECH.hahalolo.key} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceEn() {
  return (
    <section>
      <p className="about-section-title">Experience</p>

      {/* Cake */}
      <div className="mb-5">
        <div className="cv-company">
          <span className="cv-company-name">Cake by VPBank — Digital Bank</span>
          <span className="cv-company-line" />
        </div>
        <div className="cv-timeline">
          {/* Data Scientist */}
          <div className="cv-role">
            <span className="cv-dot current" />
            <div className="cv-role-card current">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2.5">
                <span className="text-sm font-semibold" style={{ color: "var(--brand-from)" }}>Data Scientist</span>
                <span className="text-xs font-mono" style={{ color: "var(--foreground-secondary)" }}>Dec 2025 — present</span>
              </div>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Building <strong>CakeAutoML</strong> — end-to-end automated credit scoring:{" "}
                  <span style={{ color: "var(--foreground-secondary)" }}>Label Preparation → Data Preparation → Feature Selection → Training → Validator</span>{" "}
                  — bringing training time down to <strong>under 60 minutes</strong>.
                </li>
                <li className="leading-relaxed">
                  Contributing to the <strong>ML workflow</strong>: DAG orchestration, standardising training and deployment.
                </li>
                <li className="leading-relaxed">
                  Researching <strong>Alternative Credit Scoring</strong> using <em>transaction behaviour</em> + <em>app-usage</em> signals
                  for <strong>Embedded Finance</strong> products.
                </li>
              </ul>
              <TechChips chips={TECH.dataScientist.all} keyChips={TECH.dataScientist.key} />
            </div>
          </div>

          {/* Data AI Engineer */}
          <div className="cv-role">
            <span className="cv-dot" />
            <div className="cv-role-card">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1.5">
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Data AI Engineer</span>
                <span className="text-xs font-mono" style={{ color: "var(--foreground-secondary)" }}>Jul 2023 — Nov 2025</span>
              </div>
              <p className="text-xs mb-2.5 italic" style={{ color: "var(--foreground-secondary)" }}>
                PIC for most AI products — coordinating directly with PMs, Backend Engineers, CS &amp; Ops teams.
              </p>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Led end-to-end <strong>multi-agent chat system</strong> (supervisor + hybrid RAG) —
                  automating <strong>70–80% of incoming chats</strong> at <strong>90% accuracy</strong> (CS-validated).
                </li>
                <li className="leading-relaxed">
                  <strong>CMS</strong>: automated case classification &amp; email triage — request → classify → assign downstream;
                  reduced <strong>~70% manual effort</strong>.
                </li>
                <li className="leading-relaxed">
                  <strong>Data Modeling</strong>: BigQuery &amp; Doris (Conversation Insight, Callbot, Feature Store);
                  BI via Looker Studio &amp; Superset.
                </li>
                <li className="leading-relaxed"><strong>Data Pipelines</strong>: Airflow, dbt, Kafka (batch &amp; streaming).</li>
                <li className="leading-relaxed"><strong>ML Platform</strong>: FeatureStore (Feast), MLOps, production scoring (NTB/ETB).</li>
                <li className="leading-relaxed"><strong>Auto EDA</strong> agent (MCP/DataHub-style).</li>
              </ul>
              <TechChips chips={TECH.dataAIEngineer.all} keyChips={TECH.dataAIEngineer.key} />
            </div>
          </div>
        </div>
      </div>

      {/* Hahalolo */}
      <div>
        <div className="cv-company">
          <span className="cv-company-name">Hahalolo Travel Social Network</span>
          <span className="cv-company-line" />
        </div>
        <div className="cv-timeline">
          <div className="cv-role">
            <span className="cv-dot" />
            <div className="cv-role-card">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1.5">
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>AI Engineer</span>
                <span className="text-xs font-mono" style={{ color: "var(--foreground-secondary)" }}>Mar 2022 — Jul 2023</span>
              </div>
              <p className="text-xs mb-2.5 italic" style={{ color: "var(--foreground-secondary)" }}>
                Worked directly with the CTO — built the entire Data &amp; AI stack from raw logs through to production AI products.
              </p>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Built the <strong>data warehouse from raw logs</strong>: dimensional modelling (users, posts, hashtags, activity, relationships),
                  batch, real-time &amp; lambda pipelines on MongoDB.
                </li>
                <li className="leading-relaxed">
                  <strong>Content moderation system</strong>: PhoBERT fine-tuning for semi-automated violation detection &amp; severity ranking.
                </li>
                <li className="leading-relaxed">
                  <strong>Recommendation &amp; ranking systems</strong>: friend suggestions, user &amp; hashtag ranking via graph embedding.
                </li>
              </ul>
              <TechChips chips={TECH.hahalolo.all} keyChips={TECH.hahalolo.key} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Intro sections ───────────────────────────────────────────────────────── */

function IntroVi() {
  return (
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
    </section>
  );
}

function IntroEn() {
  return (
    <section className="mb-8">
      <p className="about-section-title">About</p>
      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--foreground)" }}>
        Three years ago I was building content moderation models at a travel startup. Today
        I&apos;m automating credit decisions at a digital bank. In between: data pipelines,
        feature stores, multi-agent chat systems, and more than a few sleepless model debugging sessions.
      </p>
      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--foreground)" }}>
        I like problems where <strong>data is messy, stakes are real</strong>, and there&apos;s
        no clean benchmark to hide behind.
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
        Right now I&apos;m building <strong>CakeAutoML</strong> — an end-to-end system that takes
        raw data all the way from label preparation to a validated credit model — and researching
        whether <strong>transaction history &amp; app behaviour</strong> can score credit for people
        traditional bureaus have never seen. The intersection of{" "}
        <strong>alternative data</strong>, <strong>embedded finance</strong>, and{" "}
        <strong>production ML</strong> is where I want to spend my time.
      </p>
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

  const vi = lang === "vi";

  return (
    <div>
      {/* ── Header ── */}
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
            className="transition hover:opacity-70" style={{ color: "var(--brand-from)" }}>GitHub</a>
          <a href="https://www.linkedin.com/in/aivietqt/" target="_blank" rel="noopener noreferrer"
            className="transition hover:opacity-70" style={{ color: "var(--brand-from)" }}>LinkedIn</a>
        </div>
      </div>

      <LangToggle lang={lang} setLanguage={setLanguage} />
      <NowCard vi={vi} />
      <StatsStrip vi={vi} />

      {/* ── Intro (full width) ── */}
      {vi ? <IntroVi /> : <IntroEn />}

      {/* ── Two-column: Experience | Skills + Education + Certs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
        {/* Left: Experience */}
        <div>
          {vi ? <ExperienceVi /> : <ExperienceEn />}
        </div>

        {/* Right: Skills + Education + Certs */}
        <div>
          <SkillsSection vi={vi} />
          <EducationSection vi={vi} />
          <CertsSection vi={vi} />
        </div>
      </div>
    </div>
  );
}
