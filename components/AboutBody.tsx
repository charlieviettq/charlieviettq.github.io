"use client";

import { useEffect, useState } from "react";

const LANG_KEY = "about-lang";
type Lang = "vi" | "en";

/* ── Tech icon map — cdn.simpleicons.org slugs ───────────────────────────── */

const ICON_MAP: Record<string, string> = {
  "Python":          "python",
  "PyTorch":         "pytorch",
  "TensorFlow":      "tensorflow",
  "PhoBERT":         "pytorch",
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
  "LightGBM":        "python",
  "XGBoost":         "python",
  "Feast":           "python",
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
  { cat: "Credit Scoring & Decisioning", badges: ["PD Band", "Cutoff", "Scorecard", "OOT / Stability", "Alternative Data"] },
  { cat: "GenAI / Agentic AI", badges: ["Hybrid RAG", "Multi-agent", "Function Calling", "Eval & Tracing", "Vertex AI"] },
  { cat: "ML Platform & MLOps", badges: ["CakeAutoML", "FeatureStore (Feast)", "DAG Orchestration", "Production Scoring"] },
  { cat: "Data Platform", badges: ["Airflow", "dbt", "BigQuery", "Kafka", "Doris", "MongoDB"] },
  { cat: "Governance / Monitoring", badges: ["Calibration", "PSI", "Gini / KS", "Model Validation", "Portfolio KPIs"] },
];

const SKILL_GROUPS_EN = [
  { cat: "Credit Scoring & Decisioning", badges: ["PD Band", "Cutoff", "Scorecard", "OOT / Stability", "Alternative Data"] },
  { cat: "GenAI / Agentic AI", badges: ["Hybrid RAG", "Multi-agent", "Function Calling", "Eval & Tracing", "Vertex AI"] },
  { cat: "ML Platform & MLOps", badges: ["CakeAutoML", "FeatureStore (Feast)", "DAG Orchestration", "Production Scoring"] },
  { cat: "Data Platform", badges: ["Airflow", "dbt", "BigQuery", "Kafka", "Doris", "MongoDB"] },
  { cat: "Governance / Monitoring", badges: ["Calibration", "PSI", "Gini / KS", "Model Validation", "Portfolio KPIs"] },
];

/* ── Sub-components ───────────────────────────────────────────────────────── */

function LangToggle({ lang, setLanguage }: { lang: Lang; setLanguage: (l: Lang) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Chọn ngôn ngữ / Language">
      <div className="inline-flex rounded-full p-1" style={{ border: "1px solid var(--border-warm)", background: "var(--surface-100)" }}>
        {(["vi", "en"] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLanguage(l)}
            className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition"
            style={lang === l ? { background: "var(--foreground)", color: "var(--background)" } : { color: "var(--foreground-secondary)" }}
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
        {["CakeAutoML", "Credit Decisioning", "GenAI Systems", "ML Platform"].map((tag) => (
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
                  Xây dựng <strong>CakeAutoML</strong> như một workflow credit scoring end-to-end:{" "}
                  <span style={{ color: "var(--foreground-secondary)" }}>Label Preparation → Data Preparation → Feature Selection → Training → Validator</span>{" "}
                  — đưa thời gian training xuống <strong>dưới 60 phút</strong> và giúp model development lặp lại được.
                </li>
                <li className="leading-relaxed">
                  Chuẩn hoá <strong>ML workflow</strong> cho scoring: orchestration DAG, train/validation/OOT, stability checks, và handoff sang production scoring.
                </li>
                <li className="leading-relaxed">
                  Nghiên cứu &amp; triển khai <strong>Alternative Credit Scoring</strong> từ tín hiệu{" "}
                  <em>transaction behaviour</em> + <em>app usage</em> cho use case thin-file và <strong>Embedded Finance</strong>.
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
                PIC cho nhiều sản phẩm AI trong digital bank — làm việc trực tiếp với PM, Backend Engineers, CS &amp; Ops để đưa AI vào workflow vận hành.
              </p>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Dẫn triển khai end-to-end <strong>multi-agent customer support system</strong> (supervisor + hybrid RAG) —
                  automate <strong>70–80% lượt chat</strong> với <strong>90% chính xác</strong> trên mẫu CS validate.
                </li>
                <li className="leading-relaxed">
                  Xây <strong>case &amp; email automation</strong>: nhận request → phân loại → assign downstream;
                  giảm <strong>~70% thao tác thủ công</strong>.
                </li>
                <li className="leading-relaxed">
                  Xây nền dữ liệu cho AI product: BigQuery &amp; Doris cho Conversation Insight, Callbot, Feature Store; BI qua Looker Studio &amp; Superset.
                </li>
                <li className="leading-relaxed">
                  Vận hành <strong>data pipelines</strong> batch &amp; streaming với Airflow, dbt, Kafka để phục vụ analytics, automation và scoring.
                </li>
                <li className="leading-relaxed">
                  Đóng góp <strong>ML Platform</strong>: FeatureStore (Feast), MLOps, scoring production cho NTB/ETB workflows.
                </li>
                <li className="leading-relaxed"><strong>AI Analytics / Auto EDA</strong> agent theo hướng metadata discovery, NL-to-SQL và charting workflow.</li>
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
                Làm việc trực tiếp với CTO — nền tảng đầu tiên về data stack, NLP moderation và recommendation/ranking ở production.
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
                  Building <strong>CakeAutoML</strong> as an end-to-end credit scoring workflow:{" "}
                  <span style={{ color: "var(--foreground-secondary)" }}>Label Preparation → Data Preparation → Feature Selection → Training → Validator</span>{" "}
                  — bringing training time down to <strong>under 60 minutes</strong> and making model development repeatable.
                </li>
                <li className="leading-relaxed">
                  Standardising the <strong>ML workflow</strong> for scoring: DAG orchestration, train/validation/OOT, stability checks, and production scoring handoff.
                </li>
                <li className="leading-relaxed">
                  Researching <strong>Alternative Credit Scoring</strong> using <em>transaction behaviour</em> + <em>app-usage</em> signals
                  for thin-file and <strong>Embedded Finance</strong> use cases.
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
                PIC for multiple AI products in a digital bank — working directly with PMs, Backend Engineers, CS &amp; Ops to put AI into operating workflows.
              </p>
              <ul className="space-y-1.5 text-sm" style={{ color: "var(--foreground)" }}>
                <li className="leading-relaxed">
                  Led an end-to-end <strong>multi-agent customer support system</strong> (supervisor + hybrid RAG) —
                  automating <strong>70–80% of incoming chats</strong> at <strong>90% accuracy</strong> on CS-validated samples.
                </li>
                <li className="leading-relaxed">
                  Built <strong>case &amp; email automation</strong>: request → classify → assign downstream;
                  reduced <strong>~70% manual effort</strong>.
                </li>
                <li className="leading-relaxed">
                  Built the data foundation for AI products: BigQuery &amp; Doris for Conversation Insight, Callbot, and Feature Store;
                  BI through Looker Studio &amp; Superset.
                </li>
                <li className="leading-relaxed"><strong>Data Pipelines</strong>: Airflow, dbt, Kafka for batch and streaming analytics, automation, and scoring workloads.</li>
                <li className="leading-relaxed"><strong>ML Platform</strong>: FeatureStore (Feast), MLOps, production scoring for NTB/ETB workflows.</li>
                <li className="leading-relaxed"><strong>AI Analytics / Auto EDA</strong> agent with metadata discovery, NL-to-SQL, and charting workflows.</li>
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
                Worked directly with the CTO — early foundation in data stacks, NLP moderation, and recommendation/ranking in production.
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
        Tôi làm Data Science cho fintech: xây hệ thống AI/ML biến dữ liệu ngân hàng thành quyết định thực tế
        như credit scoring, approval, limit, monitoring, customer automation và analytics agents.
      </p>
      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--foreground)" }}>
        Điểm mạnh của tôi nằm ở vùng giao nhau giữa <strong>credit decision science</strong>,{" "}
        <strong>GenAI agents</strong> và <strong>data/ML platform engineering</strong>. Tôi thích những bài toán mà
        data lộn xộn, stakeholder cần quyết định thật, và model phải sống được trong workflow vận hành.
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
        Hiện tại tôi đang build <strong>CakeAutoML</strong> cho credit scoring workflow và nghiên cứu{" "}
        <strong>alternative data</strong> từ lịch sử giao dịch, hành vi ứng dụng cho thin-file/embedded finance.
        Trước đó, tôi xây multi-agent RAG, automation cho CS/Ops, analytics agents, data pipelines và feature store.
        Vì vậy portfolio này kể một câu chuyện thống nhất: AI/ML trong fintech phải đi từ raw data đến production decision.
      </p>
    </section>
  );
}

function IntroEn() {
  return (
    <section className="mb-8">
      <p className="about-section-title">About</p>
      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--foreground)" }}>
        I&apos;m a Data Scientist building AI/ML systems for fintech: turning banking data into credit scoring,
        approvals, limits, monitoring, customer automation, and analytics agents.
      </p>
      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--foreground)" }}>
        My work sits at the intersection of <strong>credit decision science</strong>,{" "}
        <strong>GenAI agents</strong>, and <strong>data/ML platform engineering</strong>. I like problems where
        data is messy, stakeholders need real decisions, and models have to survive operating workflows.
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
        Right now I&apos;m building <strong>CakeAutoML</strong> for credit scoring workflows and researching{" "}
        <strong>alternative data</strong> from transaction behaviour and app usage for thin-file/embedded finance.
        Before that, I built multi-agent RAG, CS/Ops automation, analytics agents, data pipelines, and feature stores.
        The common thread is simple: fintech AI/ML should move from raw data to production decisions.
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
      <div className="about-hero">
        <div>
          <p className="eyebrow">About</p>
          <h1 className="mt-4 font-heading text-5xl font-semibold tracking-[-0.04em] sm:text-6xl" style={{ color: "var(--foreground)" }}>
            Trần Quốc Việt
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8" style={{ color: "var(--foreground-secondary)" }}>
            Data Scientist building fintech AI/ML systems across credit decisioning,
            GenAI agents, data platforms, and production scoring in Ho Chi Minh City.
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 sm:items-end">
          <LangToggle lang={lang} setLanguage={setLanguage} />
          <div className="flex gap-3 text-sm font-semibold">
          <a href="https://github.com/charlieviettq" target="_blank" rel="noopener noreferrer"
            className="text-link">GitHub</a>
          <a href="https://www.linkedin.com/in/aivietqt/" target="_blank" rel="noopener noreferrer"
            className="text-link">LinkedIn</a>
          </div>
        </div>
      </div>

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
