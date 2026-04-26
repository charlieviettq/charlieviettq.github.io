"use client";

import { useEffect, useState } from "react";

const LANG_KEY = "about-lang";

type Lang = "vi" | "en";

/* ── Tech icon map — cdn.simpleicons.org slugs ───────────────────────────── */

const ICON_MAP: Record<string, string> = {
  "Python":          "python",
  "PyTorch":         "pytorch",
  "TensorFlow":      "tensorflow",
  "PhoBERT":         "pytorch",        // no dedicated icon, use PyTorch
  "MongoDB":         "mongodb",
  "Airflow":         "apacheairflow",
  "Kafka":           "apachekafka",
  "dbt":             "dbt",
  "GCP":             "googlecloud",
  "BigQuery":        "googlebigquery",
  "Vertex AI":       "googlecloud",
  "Looker Studio":   "looker",
  "LangChain":       "langchain",
  "Feast":           "python",         // no dedicated icon
  "Doris":           "apachedoris",
  "Superset":        "apachesuperset",
  "Kafka / Stream":  "apachekafka",
  "Jenkins":         "jenkins",
  "Gemini / OpenAI": "openai",
};

/* ── Per-role tech stacks ─────────────────────────────────────────────────── */

const TECH = {
  cake: ["Python", "LangChain", "Gemini / OpenAI", "Airflow", "dbt", "BigQuery", "Doris", "Kafka", "Feast", "GCP", "Vertex AI", "Looker Studio", "Superset"],
  hahalolo: ["Python", "PyTorch", "TensorFlow", "PhoBERT", "MongoDB", "Airflow", "Kafka", "Jenkins"],
};

/* ── TechChips ───────────────────────────────────────────────────────────── */

function TechChips({ chips }: { chips: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 not-prose">
      {chips.map((chip) => {
        const slug = ICON_MAP[chip];
        return (
          <span
            key={chip}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400"
          >
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
                  filter: "grayscale(0.3) opacity(0.7)",
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

/* ── Main toggle ─────────────────────────────────────────────────────────── */

export function AboutBody() {
  const [lang, setLang] = useState<Lang>("vi");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "vi") setLang(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setLanguage = (next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <div
        className="mb-6 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Chọn ngôn ngữ / Language"
      >
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Language / Ngôn ngữ:
        </span>
        <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setLanguage("vi")}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              lang === "vi"
                ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            Tiếng Việt
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              lang === "en"
                ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {lang === "vi" ? <AboutVi /> : <AboutEn />}
    </>
  );
}

function AboutVi() {
  return (
    <>
      <p>
        Mình là <strong>Trần Quốc Việt</strong> — làm việc tại <strong>TP. Hồ Chí Minh</strong>{" "}
        với định vị <strong>Machine Learning Engineer</strong>, tập trung{" "}
        <strong>hệ agentic</strong>, <strong>GenAI</strong> và <strong>nền dữ liệu</strong> trong
        bối cảnh sản phẩm số và ngân hàng số. Mình kết nối <strong>pipeline batch &amp; stream</strong>
        , <strong>warehouse / lakehouse</strong>, <strong>MLOps &amp; feature store</strong>, và{" "}
        <strong>RAG / multi-agent</strong> để đưa mô hình vào vận hành có đo lường, kiểm thử và
        quan sát end-to-end.
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Nội dung trang là mô tả năng lực cá nhân; không phải thông tin chính thức của tổ chức
        hay lời khuyên đầu tư.
      </p>

      <h2>Kinh nghiệm</h2>
      <h3 className="!mt-4 !mb-2 text-base font-semibold">
        Cake by VPBank — Digital Bank · <span className="font-normal">Data AI Engineer</span>
      </h3>
      <p className="!mt-0 text-sm text-zinc-600 dark:text-zinc-400">T7/2023 — hiện tại · TP.HCM</p>
      <ul>
        <li>
          Dẫn triển khai end-to-end <strong>hệ chat agent</strong> kiến trúc multi-agent (supervisor),
          kết hợp <strong>hybrid RAG</strong>, function calling và GenAI; mục tiêu vận hành ghi nhận
          khoảng <strong>~80% hỗ trợ người dùng tự động</strong> (theo mô tả nội bộ), kèm test/eval,
          tracing, logging và orchestration hành động.
        </li>
        <li>
          <strong>Callbot</strong> và pipeline dữ liệu streaming + batch, dashboard báo cáo/giám
          sát phục vụ vận hành và chi phí.
        </li>
        <li>
          Cải tiến <strong>CMS</strong> với tự động phân tích case (~70% theo mô tả dự án), giảm thao
          tác thủ công.
        </li>
        <li>
          Mô hình dữ liệu trên <strong>BigQuery</strong> và <strong>Doris</strong> cho Conversation
          Insight, Callbot, Feature Store; phục vụ BI qua <strong>Looker Studio</strong> và{" "}
          <strong>Superset</strong>.
        </li>
        <li>
          <strong>MLOps</strong>, feature engineering với <strong>Feast</strong>,{" "}
          <strong>Airflow</strong>, <strong>dbt</strong> (SQL/Python), hỗ trợ scoring production và
          đánh giá tín dụng/rủi ro (NTB/ETB).
        </li>
        <li>
          Công cụ <strong>Auto EDA</strong> qua chatting agent, áp dụng kỹ thuật MCP/DataHub để rút
          ngắn vòng lặp khám phá dữ liệu.
        </li>
      </ul>
      <TechChips chips={TECH.cake} />

      <h3 className="!mt-6 !mb-2 text-base font-semibold">
        Hahalolo Travel Social Network · <span className="font-normal">AI Engineer</span>
      </h3>
      <p className="!mt-0 text-sm text-zinc-600 dark:text-zinc-400">3/2022 — 7/2023 · TP.HCM</p>
      <ul>
        <li>
          Xây <strong>data warehouse</strong> trên MongoDB, pipeline <strong>batch</strong>,{" "}
          <strong>real-time</strong> và kiến trúc <strong>lambda</strong>.
        </li>
        <li>
          Thiết kế mô hình dữ liệu (user, hashtag, post, tương tác, quan hệ) phục vụ phân tích.
        </li>
        <li>
          <strong>Kiểm duyệt nội dung</strong>: fine-tune <strong>PhoBERT</strong>, bán tự động phát
          hiện vi phạm và xếp hạng mức độ cho reviewer.
        </li>
        <li>
          <strong>Gợi ý tour</strong> và <strong>gợi ý bạn bè</strong> dùng graph embedding; phối hợp
          backend/QC, API và triển khai.
        </li>
      </ul>
      <TechChips chips={TECH.hahalolo} />

      <h2>Trọng tâm kỹ thuật</h2>
      <ul>
        <li>
          <strong>Nền tảng dữ liệu</strong> — ELT, Kafka, Airflow, dbt, BigQuery, MongoDB; pipeline
          batch/stream và báo cáo vận hành.
        </li>
        <li>
          <strong>ML &amp; MLOps</strong> — feature store (Feast), huấn luyện/tái lập cấu hình,
          scoring production, AutoML trong bối cảnh rủi ro tín dụng (theo dự án Cake).
        </li>
        <li>
          <strong>GenAI &amp; agent</strong> — RAG hybrid, multi-agent, function calling, đánh giá &amp;
          tracing; Vertex AI / GCP.
        </li>
        <li>
          <strong>Ứng dụng cổ điển</strong> — NLP (PhoBERT), recommendation, graph embedding (giai
          đoạn Hahalolo).
        </li>
        <li>
          <strong>Cloud &amp; BI</strong> — GCP, Looker Studio, Superset; Doris cho workload phân
          tích tương ứng.
        </li>
      </ul>

      <h2>Học vấn &amp; ghi nhận</h2>
      <p>
        <strong>Đại học FPT</strong> — Cử nhân <strong>Trí tuệ nhân tạo</strong> (10/2019 — 10/2023),
        xếp loại <strong>Very Good</strong>. Học bổng <strong>100% Đại học FPT</strong>; học bổng{" "}
        <strong>100%++ tập đoàn FPT cho tỉnh Bình Định</strong>; <strong>Top 10 học sinh tỉnh Bình Định</strong>{" "}
        (bậc phổ thông — theo hồ sơ công khai).
      </p>

      <h2>Chứng chỉ (chọn lọc)</h2>
      <ul>
        <li>
          <strong>Natural Language Processing</strong> — DeepLearning.AI (6/2023)
        </li>
        <li>
          <strong>Fundamentals of Machine Learning in Finance</strong> — NYU Tandon School of
          Engineering (6/2023)
        </li>
      </ul>

      <h2>Links</h2>
      <ul>
        <li>
          <a href="https://github.com/charlieviettq">GitHub — charlieviettq</a> (README: stack, pins)
        </li>
        <li>
          <a href="https://www.linkedin.com/in/aivietqt/">LinkedIn — aivietqt</a>
        </li>
      </ul>
    </>
  );
}

function AboutEn() {
  return (
    <>
      <p>
        I&apos;m <strong>Tran Quoc Viet</strong>, based in <strong>Ho Chi Minh City</strong>. I work
        as a <strong>Machine Learning Engineer</strong> with a focus on{" "}
        <strong>agentic systems</strong>, <strong>GenAI</strong>, and <strong>data platforms</strong>{" "}
        in digital-banking and product settings. I connect <strong>batch and streaming pipelines</strong>
        , <strong>warehouse / lakehouse</strong> modeling, <strong>MLOps and feature stores</strong>,
        and <strong>RAG / multi-agent</strong> patterns so models ship with testing, evaluation, and
        production observability.
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This page describes my own skills and experience; it is not an official statement by any
        employer and not investment advice.
      </p>

      <h2>Experience</h2>
      <h3 className="!mt-4 !mb-2 text-base font-semibold">
        Cake by VPBank — Digital Bank · <span className="font-normal">Data AI Engineer</span>
      </h3>
      <p className="!mt-0 text-sm text-zinc-600 dark:text-zinc-400">Jul 2023 — present · HCMC</p>
      <ul>
        <li>
          Led end-to-end <strong>chat agent</strong> development using a <strong>multi-agent</strong>{" "}
          architecture with a <strong>supervisor</strong> pattern, <strong>hybrid RAG</strong>,
          function calling, and GenAI — targeting roughly <strong>~80% automated user support</strong>{" "}
          (as reported in-role), with automated tests, evaluation, tracing, logging, and action
          orchestration.
        </li>
        <li>
          <strong>Callbot</strong> support via streaming and batch data pipelines plus reporting and
          monitoring dashboards for operations and cost insight.
        </li>
        <li>
          <strong>CMS</strong> enhancements with ~<strong>70% automated case parsing</strong> to cut
          manual work.
        </li>
        <li>
          Data models in <strong>BigQuery</strong> and <strong>Doris</strong> for Conversation
          Insight, Callbot, and Feature Store; BI via <strong>Looker Studio</strong> and{" "}
          <strong>Superset</strong>.
        </li>
        <li>
          <strong>MLOps</strong>, feature engineering with <strong>Feast</strong>,{" "}
          <strong>Airflow</strong>, and <strong>dbt</strong> (SQL/Python) for production scoring and
          credit/risk use cases (NTB/ETB).
        </li>
        <li>
          <strong>Auto EDA</strong> tooling through a chatting agent using MCP/DataHub-style
          techniques for faster exploratory analytics.
        </li>
      </ul>
      <TechChips chips={TECH.cake} />

      <h3 className="!mt-6 !mb-2 text-base font-semibold">
        Hahalolo Travel Social Network · <span className="font-normal">AI Engineer</span>
      </h3>
      <p className="!mt-0 text-sm text-zinc-600 dark:text-zinc-400">Mar 2022 — Jul 2023 · HCMC</p>
      <ul>
        <li>
          Built a <strong>data warehouse</strong> on MongoDB; <strong>batch</strong>,{" "}
          <strong>real-time</strong>, and <strong>lambda-style</strong> pipelines.
        </li>
        <li>
          Designed dimensional models (users, hashtags, posts, activity, relationships) for
          analytics.
        </li>
        <li>
          <strong>Content moderation</strong>: <strong>PhoBERT</strong> fine-tuning for semi-automated
          violation detection and severity ranking for human review.
        </li>
        <li>
          <strong>Recommendation</strong> for tours and friend suggestions using graph embedding;
          collaboration with backend/QC on APIs and releases.
        </li>
      </ul>
      <TechChips chips={TECH.hahalolo} />

      <h2>Technical focus</h2>
      <ul>
        <li>
          <strong>Data platforms</strong> — ELT, Kafka, Airflow, dbt, BigQuery, MongoDB; batch/stream
          patterns and operational reporting.
        </li>
        <li>
          <strong>ML &amp; MLOps</strong> — Feast feature store, reproducible training configs,
          production scoring, AutoML in credit-risk contexts (Cake).
        </li>
        <li>
          <strong>GenAI &amp; agents</strong> — hybrid RAG, multi-agent systems, function calling,
          eval and tracing; Vertex AI / GCP.
        </li>
        <li>
          <strong>Classical ML / NLP</strong> — PhoBERT, recommender systems, graph embeddings
          (Hahalolo era).
        </li>
        <li>
          <strong>Cloud &amp; BI</strong> — GCP, Looker Studio, Superset; Doris for relevant
          analytics workloads.
        </li>
      </ul>

      <h2>Education &amp; recognition</h2>
      <p>
        <strong>FPT University</strong> — Bachelor&apos;s in <strong>Artificial Intelligence</strong>{" "}
        (Oct 2019 — Oct 2023), <strong>Very Good</strong>. <strong>100% scholarship</strong> at FPT
        University; <strong>100%++ FPT Corporation scholarship</strong> for Binh Dinh province;{" "}
        <strong>Top 10 scholarships of Binh Dinh province</strong> (secondary level — per public
        profile).
      </p>

      <h2>Certifications (selected)</h2>
      <ul>
        <li>
          <strong>Natural Language Processing</strong> — DeepLearning.AI (Jun 2023)
        </li>
        <li>
          <strong>Fundamentals of Machine Learning in Finance</strong> — NYU Tandon School of
          Engineering (Jun 2023)
        </li>
      </ul>

      <h2>Links</h2>
      <ul>
        <li>
          <a href="https://github.com/charlieviettq">GitHub — charlieviettq</a> (README: stack,
          pins)
        </li>
        <li>
          <a href="https://www.linkedin.com/in/aivietqt/">LinkedIn — aivietqt</a>
        </li>
      </ul>
    </>
  );
}
