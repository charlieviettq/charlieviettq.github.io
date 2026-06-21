import type { Metadata } from "next";
import { AboutBody } from "@/components/AboutBody";

export const metadata: Metadata = {
  title: "About",
  description:
    "Trần Quốc Việt — Data Scientist building fintech AI/ML systems across credit decisioning, GenAI agents, data platforms, and production scoring.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <AboutBody />
    </main>
  );
}
