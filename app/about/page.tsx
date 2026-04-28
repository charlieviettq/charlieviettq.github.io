import type { Metadata } from "next";
import { AboutBody } from "@/components/AboutBody";
import { GradientCard } from "@/components/GradientCard";

export const metadata: Metadata = {
  title: "About",
  description:
    "Trần Quốc Việt — Data Scientist, Credit Scoring & ML; Cake by VPBank, ex-Hahalolo; HCMC.",
};

export default function AboutPage() {
  return (
    <GradientCard>
      <AboutBody />
    </GradientCard>
  );
}
