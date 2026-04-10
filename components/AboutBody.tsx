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
        Mình là <strong>Trần Quốc Việt</strong> (Charlie), đang làm việc tại{" "}
        <strong>TP. Hồ Chí Minh</strong>. Mình build <strong>data platform</strong>,{" "}
        <strong>hệ ML</strong> và <strong>sản phẩm AI</strong> end-to-end — từ pipeline
        batch/stream, mô hình dimensional trên warehouse, tới huấn luyện model, triển
        khai API và trải nghiệm LLM — với trọng tâm{" "}
        <strong>quan sát được (observability)</strong>, an toàn dữ liệu &amp; prompt, và
        những thứ team có thể vận hành trong bối cảnh có kiểm soát.
      </p>

      <h2>Focus areas</h2>
      <ul>
        <li>
          <strong>Data engineering &amp; analytics</strong> — Airflow, dbt, BigQuery,
          ELT, chất lượng dữ liệu, pattern batch/stream.
        </li>
        <li>
          <strong>Data science — credit scoring &amp; retail risk</strong> — feature từ
          raw và curated marts, WOE/IV khi phù hợp, scorecard và gradient boosting (vd.
          XGBoost), calibration và trade-off ngưỡng quyết định, tách train–validation–OOT,
          ổn định dân sách / drift, scoring qua API trong production; từng làm việc cạnh
          AutoML và pattern feature store (Feast, config huấn luyện tái lập, backtest).
        </li>
        <li>
          <strong>GenAI &amp; agents</strong> — RAG, routing multi-agent, trợ lý NL→SQL /
          analytics, vector store (PostgreSQL / pgvector), Vertex AI / cổng LLM kiểu
          LiteLLM, quan sát kiểu Langfuse.
        </li>
        <li>
          <strong>Cloud &amp; platform</strong> — GCP (Pub/Sub, BigQuery, …), Terraform
          (GCP, Azure AD, DB, Vault), dịch vụ container hóa.
        </li>
      </ul>

      <h2>Recognition (public)</h2>
      <p>
        Học bổng <strong>Top 10 tỉnh Bình Định</strong>; học bổng{" "}
        <strong>100% Đại học FPT</strong> — ghi nhận giống như trên{" "}
        <a href="https://github.com/charlieviettq/charlieviettq">GitHub profile README</a>
        .
      </p>

      <h2>Links</h2>
      <ul>
        <li>
          <a href="https://github.com/charlieviettq">GitHub — charlieviettq</a> (README đầy
          đủ hơn: tech stack, pins, reach-out)
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
        I&apos;m <strong>Tran Quoc Viet</strong> (Charlie), based in{" "}
        <strong>Ho Chi Minh City</strong>. I build <strong>data platforms</strong>,{" "}
        <strong>ML systems</strong>, and <strong>AI products</strong> end to end — from
        batch/stream pipelines and dimensional warehouse models to model training, API
        deployment, and LLM-powered experiences — with a focus on{" "}
        <strong>observability</strong>, data and prompt hygiene, and shipping work that
        operations teams can run in controlled environments.
      </p>

      <h2>Focus areas</h2>
      <ul>
        <li>
          <strong>Data engineering &amp; analytics</strong> — Airflow, dbt, BigQuery,
          ELT, data quality, batch/stream patterns.
        </li>
        <li>
          <strong>Data science — credit scoring &amp; retail risk</strong> — features
          from raw and curated marts, WOE/IV where appropriate, scorecards and gradient
          boosting (e.g. XGBoost), calibration and decision-threshold tradeoffs,
          train–validation–OOT splits, population stability / drift, production scoring
          APIs; experience alongside AutoML and feature-store patterns (Feast,
          reproducible training configs, backtesting).
        </li>
        <li>
          <strong>GenAI &amp; agents</strong> — RAG, multi-agent routing, NL→SQL /
          analytics assistants, vector stores (PostgreSQL / pgvector), Vertex AI /
          LiteLLM-style gateways, Langfuse-style observability.
        </li>
        <li>
          <strong>Cloud &amp; platform</strong> — GCP (Pub/Sub, BigQuery, …), Terraform
          (GCP, Azure AD, databases, Vault), containerized services.
        </li>
      </ul>

      <h2>Recognition (public)</h2>
      <p>
        <strong>Top 10 provincial scholarship — Binh Dinh</strong>;{" "}
        <strong>100% scholarship — FPT University</strong> — as listed on my{" "}
        <a href="https://github.com/charlieviettq/charlieviettq">GitHub profile README</a>
        .
      </p>

      <h2>Links</h2>
      <ul>
        <li>
          <a href="https://github.com/charlieviettq">GitHub — charlieviettq</a> (fuller
          README: stack, pins, how to reach me)
        </li>
        <li>
          <a href="https://www.linkedin.com/in/aivietqt/">LinkedIn — aivietqt</a>
        </li>
      </ul>
    </>
  );
}
