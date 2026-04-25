"use client";

import { useEffect, useState } from "react";

const LANG_KEY = "about-lang";

type Lang = "vi" | "en";

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
                ? "bg-amber-600 text-white shadow-sm"
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
                ? "bg-amber-600 text-white shadow-sm"
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
        Mình là <strong>Trần Quốc Việt</strong> — <strong>Data Scientist</strong> tại{" "}
        <strong>Cake by VPBank</strong>, TP. Hồ Chí Minh. Hiện tập trung vào{" "}
        <strong>Credit Scoring</strong>: xây dựng hệ thống{" "}
        <strong>CakeAutoML</strong> (Label Preparation → Data Preparation → Feature
        Selection → Training → Validator), đóng góp vào <strong>ML workflow</strong>, và
        nghiên cứu <strong>Alternative Credit Scoring</strong> dựa trên dữ liệu hành vi
        giao dịch &amp; ứng dụng cho các sản phẩm <strong>Embedded Finance</strong>.
      </p>
      <p>
        Giai đoạn trước (2023–2025) ở vai trò <strong>Data AI Engineer</strong>, mình tập
        trung vào <strong>Generative AI</strong>, <strong>Data Platform</strong> và nền tảng{" "}
        <strong>ML Platform</strong> — từ pipeline batch/stream, data modeling trên BigQuery
        &amp; Doris, đến hệ chat agent multi-agent, FeatureStore và MLOps.
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Nội dung trang là mô tả năng lực cá nhân; không phải thông tin chính thức của tổ
        chức hay lời khuyên đầu tư.
      </p>

      <hr />
      <h2>Kinh nghiệm</h2>

      {/* ── Cake — company header ── */}
      <h3 className="!mt-4 !mb-1 text-base font-semibold">
        Cake by VPBank — Digital Bank
      </h3>

      {/* Sub-role 1: Data Scientist (current) */}
      <h4 className="!mt-3 !mb-1 text-sm font-semibold" style={{ color: "var(--brand-from)" }}>
        Data Scientist
      </h4>
      <p className="!mt-0 !mb-2 text-sm text-zinc-600 dark:text-zinc-400">
        T12/2025 — hiện tại · TP.HCM
      </p>
      <ul>
        <li>
          Xây dựng <strong>CakeAutoML</strong> — hệ thống tự động hoá toàn bộ pipeline credit
          scoring: <em>Label Preparation → Data Preparation → Feature Selection → Training →
          Validator</em>; giảm thiểu can thiệp thủ công từ khâu chuẩn bị dữ liệu đến đánh giá
          mô hình.
        </li>
        <li>
          Đóng góp vào <strong>ML workflow</strong>: orchestration DAG, chuẩn hoá quy trình
          training và deployment cho nhóm Data Science.
        </li>
        <li>
          Nghiên cứu và triển khai <strong>Alternative Credit Scoring</strong> dựa trên tín
          hiệu hành vi giao dịch (<em>transaction behaviour</em>) và hành vi ứng dụng (
          <em>app usage</em>) — phục vụ chấm điểm tín dụng cho các sản phẩm{" "}
          <strong>Embedded Finance</strong>.
        </li>
      </ul>

      {/* Sub-role 2: Data AI Engineer (previous) */}
      <h4 className="!mt-5 !mb-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Data AI Engineer
      </h4>
      <p className="!mt-0 !mb-2 text-sm text-zinc-600 dark:text-zinc-400">
        T7/2023 — T11/2025 · TP.HCM
      </p>
      <ul>
        <li>
          Dẫn triển khai end-to-end <strong>hệ chat agent</strong> kiến trúc{" "}
          <strong>multi-agent</strong> (supervisor), kết hợp <strong>hybrid RAG</strong>,
          function calling và GenAI — kèm test/eval, tracing, logging và orchestration hành
          động; hướng tới ~<strong>80% hỗ trợ người dùng tự động</strong>.
        </li>
        <li>
          <strong>Data Modeling</strong> trên <strong>BigQuery</strong> và{" "}
          <strong>Doris</strong> cho Conversation Insight, Callbot và Feature Store; phục vụ
          BI qua <strong>Looker Studio</strong> và <strong>Superset</strong>.
        </li>
        <li>
          Xây dựng <strong>Data Pipeline</strong> batch &amp; streaming (<strong>Airflow</strong>,{" "}
          <strong>dbt</strong> SQL/Python, <strong>Kafka</strong>) và dashboard giám sát vận
          hành/chi phí cho Callbot.
        </li>
        <li>
          Build nền tảng <strong>ML Platform</strong>: <strong>FeatureStore</strong> (Feast),
          MLOps, feature engineering và scoring production cho bài toán tín dụng/rủi ro
          (NTB/ETB).
        </li>
        <li>
          Công cụ <strong>Auto EDA</strong> qua chatting agent (MCP/DataHub style) để rút ngắn
          vòng lặp khám phá dữ liệu.
        </li>
        <li>
          Cải tiến <strong>CMS</strong> với tự động phân tích case (~70%), giảm thao tác thủ
          công cho team vận hành.
        </li>
      </ul>

      {/* ── Hahalolo ── */}
      <h3 className="!mt-8 !mb-2 text-base font-semibold">
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
          <strong>Kiểm duyệt nội dung</strong>: fine-tune <strong>PhoBERT</strong>, bán tự động
          phát hiện vi phạm và xếp hạng mức độ cho reviewer.
        </li>
        <li>
          <strong>Gợi ý tour</strong> và <strong>gợi ý bạn bè</strong> dùng graph embedding;
          phối hợp backend/QC, API và triển khai.
        </li>
        <li>Stack tiêu biểu: Python, Airflow, Kafka, MongoDB, PyTorch, TensorFlow, Jenkins, …</li>
      </ul>

      <hr />
      <h2>Trọng tâm kỹ thuật</h2>
      <ul>
        <li>
          <strong>Credit Scoring &amp; ML</strong> — AutoML pipeline, feature engineering, model
          training &amp; validation, alternative data (transaction behaviour, app usage),
          scorecard / boosting, OOT &amp; stability.
        </li>
        <li>
          <strong>Nền tảng dữ liệu</strong> — ELT, Kafka, Airflow, dbt, BigQuery, Doris,
          MongoDB; pipeline batch/stream và báo cáo vận hành.
        </li>
        <li>
          <strong>ML Platform &amp; MLOps</strong> — FeatureStore (Feast), orchestration DAG,
          scoring production, CI/CD cho mô hình.
        </li>
        <li>
          <strong>GenAI &amp; Agent</strong> — hybrid RAG, multi-agent (supervisor), function
          calling, eval &amp; tracing; Vertex AI / GCP.
        </li>
        <li>
          <strong>Cloud &amp; BI</strong> — GCP, Looker Studio, Superset.
        </li>
      </ul>

      <hr />
      <h2>Học vấn &amp; ghi nhận</h2>
      <p>
        <strong>Đại học FPT</strong> — Cử nhân <strong>Trí tuệ nhân tạo</strong> (10/2019 —
        10/2023), xếp loại <strong>Very Good</strong>. Học bổng{" "}
        <strong>100% Đại học FPT</strong>; học bổng{" "}
        <strong>100%++ tập đoàn FPT cho tỉnh Bình Định</strong>;{" "}
        <strong>Top 10 học sinh tỉnh Bình Định</strong> (bậc phổ thông — theo hồ sơ công khai).
      </p>

      <hr />
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

function AboutEn() {
  return (
    <>
      <p>
        I&apos;m <strong>Tran Quoc Viet</strong> — <strong>Data Scientist</strong> at{" "}
        <strong>Cake by VPBank</strong>, Ho Chi Minh City. Currently focused on{" "}
        <strong>Credit Scoring</strong>: building the <strong>CakeAutoML</strong> system
        (Label Preparation → Data Preparation → Feature Selection → Training → Validator),
        contributing to the <strong>ML workflow</strong>, and researching{" "}
        <strong>Alternative Credit Scoring</strong> using transaction behaviour and app-usage
        signals for <strong>Embedded Finance</strong> products.
      </p>
      <p>
        Previously (2023–2025) as <strong>Data AI Engineer</strong>, I focused on{" "}
        <strong>Generative AI</strong>, <strong>Data Platform</strong>, and{" "}
        <strong>ML Platform</strong> foundations — spanning batch/stream pipelines, data
        modeling on BigQuery &amp; Doris, multi-agent chat systems, FeatureStore, and MLOps.
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This page describes my own skills and experience; it is not an official statement by
        any employer and not investment advice.
      </p>

      <hr />
      <h2>Experience</h2>

      {/* ── Cake — company header ── */}
      <h3 className="!mt-4 !mb-1 text-base font-semibold">
        Cake by VPBank — Digital Bank
      </h3>

      {/* Sub-role 1: Data Scientist (current) */}
      <h4 className="!mt-3 !mb-1 text-sm font-semibold" style={{ color: "var(--brand-from)" }}>
        Data Scientist
      </h4>
      <p className="!mt-0 !mb-2 text-sm text-zinc-600 dark:text-zinc-400">
        Dec 2025 — present · HCMC
      </p>
      <ul>
        <li>
          Building <strong>CakeAutoML</strong> — an end-to-end automated credit scoring
          pipeline: <em>Label Preparation → Data Preparation → Feature Selection → Training →
          Validator</em>; reducing manual intervention from data prep through model evaluation.
        </li>
        <li>
          Contributing to the <strong>ML workflow</strong>: DAG orchestration, standardising
          training and deployment processes across the Data Science team.
        </li>
        <li>
          Researching and implementing <strong>Alternative Credit Scoring</strong> using
          transaction behaviour and app-usage signals — enabling credit assessment for{" "}
          <strong>Embedded Finance</strong> products.
        </li>
      </ul>

      {/* Sub-role 2: Data AI Engineer (previous) */}
      <h4 className="!mt-5 !mb-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Data AI Engineer
      </h4>
      <p className="!mt-0 !mb-2 text-sm text-zinc-600 dark:text-zinc-400">
        Jul 2023 — Nov 2025 · HCMC
      </p>
      <ul>
        <li>
          Led end-to-end development of a <strong>multi-agent chat system</strong> (supervisor
          architecture) with <strong>hybrid RAG</strong>, function calling, and GenAI —
          including automated tests, evaluation, tracing, logging, and action orchestration;
          targeting ~<strong>80% automated user support</strong>.
        </li>
        <li>
          <strong>Data Modeling</strong> on <strong>BigQuery</strong> and{" "}
          <strong>Doris</strong> for Conversation Insight, Callbot, and Feature Store; BI via{" "}
          <strong>Looker Studio</strong> and <strong>Superset</strong>.
        </li>
        <li>
          Built batch &amp; streaming <strong>Data Pipelines</strong> (<strong>Airflow</strong>,{" "}
          <strong>dbt</strong> SQL/Python, <strong>Kafka</strong>) and operational/cost
          monitoring dashboards for the Callbot.
        </li>
        <li>
          Established <strong>ML Platform</strong> foundations: <strong>FeatureStore</strong>{" "}
          (Feast), MLOps, feature engineering, and production scoring for credit/risk use cases
          (NTB/ETB).
        </li>
        <li>
          <strong>Auto EDA</strong> tooling via a chatting agent (MCP/DataHub-style) to
          accelerate exploratory analytics cycles.
        </li>
        <li>
          <strong>CMS</strong> enhancements with ~<strong>70% automated case parsing</strong>{" "}
          to reduce manual workload for operations teams.
        </li>
      </ul>

      {/* ── Hahalolo ── */}
      <h3 className="!mt-8 !mb-2 text-base font-semibold">
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
          <strong>Content moderation</strong>: <strong>PhoBERT</strong> fine-tuning for
          semi-automated violation detection and severity ranking for human review.
        </li>
        <li>
          <strong>Recommendation</strong> for tours and friend suggestions using graph
          embedding; collaboration with backend/QC on APIs and releases.
        </li>
        <li>Stack highlights: Python, Airflow, Kafka, MongoDB, PyTorch, TensorFlow, Jenkins, …</li>
      </ul>

      <hr />
      <h2>Technical focus</h2>
      <ul>
        <li>
          <strong>Credit Scoring &amp; ML</strong> — AutoML pipelines, feature engineering,
          model training &amp; validation, alternative data (transaction behaviour, app usage),
          scorecards / boosting, OOT &amp; stability monitoring.
        </li>
        <li>
          <strong>Data platforms</strong> — ELT, Kafka, Airflow, dbt, BigQuery, Doris,
          MongoDB; batch/stream patterns and operational reporting.
        </li>
        <li>
          <strong>ML Platform &amp; MLOps</strong> — FeatureStore (Feast), DAG orchestration,
          production scoring, model CI/CD.
        </li>
        <li>
          <strong>GenAI &amp; agents</strong> — hybrid RAG, multi-agent systems (supervisor),
          function calling, eval &amp; tracing; Vertex AI / GCP.
        </li>
        <li>
          <strong>Cloud &amp; BI</strong> — GCP, Looker Studio, Superset.
        </li>
      </ul>

      <hr />
      <h2>Education &amp; recognition</h2>
      <p>
        <strong>FPT University</strong> — Bachelor&apos;s in{" "}
        <strong>Artificial Intelligence</strong> (Oct 2019 — Oct 2023),{" "}
        <strong>Very Good</strong>. <strong>100% scholarship</strong> at FPT University;{" "}
        <strong>100%++ FPT Corporation scholarship</strong> for Binh Dinh province;{" "}
        <strong>Top 10 scholarships of Binh Dinh province</strong> (secondary level — per
        public profile).
      </p>

      <hr />
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
