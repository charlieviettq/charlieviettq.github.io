import type { Metadata } from "next";
import { AboutBody } from "@/components/AboutBody";
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
        <AboutBody />
      </article>
    </GradientCard>
  );
}
