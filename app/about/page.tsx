import type { Metadata } from "next";
import { GradientCard } from "@/components/GradientCard";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <GradientCard>
      <article className="prose prose-zinc max-w-none dark:prose-invert prose-a:text-sky-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline dark:prose-a:text-sky-400">
        <h1>About</h1>
        <p>
          <strong>VI.</strong> Mình là <strong>Trần Quốc Việt</strong> (Charlie), làm
          việc xoay quanh <strong>data platform</strong>,{" "}
          <strong>ML / credit scoring</strong>, và <strong>GenAI</strong> (RAG, agent,
          LLM ops). Thích pipeline sạch (Airflow, dbt, BigQuery, GCP), triển khai model
          có kiểm soát, và sản phẩm AI có thể vận hành.
        </p>
        <p>
          <strong>EN.</strong> I work across <strong>data platforms</strong>,{" "}
          <strong>ML / credit risk</strong>, and <strong>GenAI</strong> (RAG, agents,
          LLM ops). I care about solid pipelines (Airflow, dbt, BigQuery, GCP),
          disciplined model delivery, and AI products teams can run in production.
        </p>
        <h2>Links</h2>
        <ul>
          <li>
            <a href="https://github.com/charlieviettq">GitHub — charlieviettq</a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/aivietqt/">LinkedIn</a>
          </li>
        </ul>
      </article>
    </GradientCard>
  );
}
