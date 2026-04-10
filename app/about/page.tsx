import type { Metadata } from "next";
import { GradientCard } from "@/components/GradientCard";

export const metadata: Metadata = {
  title: "About",
  description:
    "Trần Quốc Việt (Charlie) — analytics, data platform, ML, GenAI; HCMC.",
};

export default function AboutPage() {
  return (
    <GradientCard>
      <article className="prose prose-zinc max-w-none dark:prose-invert prose-a:text-sky-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline dark:prose-a:text-sky-400">
        <h1>About</h1>

        <p>
          <strong>VI.</strong> Mình là <strong>Trần Quốc Việt</strong> (Charlie), đang
          làm việc tại <strong>TP. Hồ Chí Minh</strong>. Mình build{" "}
          <strong>data platform</strong>, <strong>hệ ML</strong> và{" "}
          <strong>sản phẩm AI</strong> end-to-end — từ pipeline batch/stream, mô hình
          dimensional trên warehouse, tới huấn luyện model, triển khai API và trải
          nghiệm LLM — với trọng tâm <strong>quan sát được (observability)</strong>,
          an toàn dữ liệu &amp; prompt, và những thứ team có thể vận hành trong bối cảnh
          có kiểm soát.
        </p>
        <p>
          <strong>EN.</strong> I&apos;m <strong>Trần Quốc Việt</strong> (Charlie),
          based in <strong>Ho Chi Minh City</strong>. I build{" "}
          <strong>data platforms</strong>, <strong>ML systems</strong>, and{" "}
          <strong>AI products</strong> end to end —
          from batch/stream pipelines and dimensional models to training, API
          deployment, and LLM-powered experiences — with a bias toward{" "}
          <strong>observability</strong>, data &amp; prompt hygiene, and shipping work
          operations teams can run in controlled environments.
        </p>

        <h2>Focus areas</h2>
        <ul>
          <li>
            <strong>Data engineering &amp; analytics</strong> — Airflow, dbt, BigQuery,
            ELT, chất lượng dữ liệu, pattern batch/stream.
          </li>
          <li>
            <strong>Data science — credit scoring &amp; retail risk</strong> — feature từ
            raw và curated marts, WOE/IV khi phù hợp, scorecard và gradient boosting
            (vd. XGBoost), calibration và trade-off ngưỡng quyết định, tách
            train–validation–OOT, ổn định dân sách / drift, scoring qua API trong production;
            từng làm việc cạnh AutoML và pattern feature store (Feast, config huấn luyện
            tái lập, backtest).
          </li>
          <li>
            <strong>GenAI &amp; agents</strong> — RAG, routing multi-agent, trợ lý
            NL→SQL / analytics, vector store (PostgreSQL / pgvector), Vertex AI / cổng
            LLM kiểu LiteLLM, quan sát kiểu Langfuse.
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
            <a href="https://github.com/charlieviettq">GitHub — charlieviettq</a>{" "}
            (README đầy đủ hơn: tech stack, pins, reach-out)
          </li>
          <li>
            <a href="https://www.linkedin.com/in/aivietqt/">LinkedIn — aivietqt</a>
          </li>
        </ul>
      </article>
    </GradientCard>
  );
}
