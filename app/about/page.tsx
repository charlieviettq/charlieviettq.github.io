import type { Metadata } from "next";
import { AboutBody } from "@/components/AboutBody";

export const metadata: Metadata = {
  title: "About",
  description:
    "Trần Quốc Việt — Data Scientist, Credit Scoring & ML; Cake by VPBank, ex-Hahalolo; HCMC.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <AboutBody />
    </main>
  );
}
