import Link from "next/link";
import { CharlieLogoSVG } from "@/components/CharlieLogoSVG";
import { ConstellationBg } from "@/components/ConstellationBg";
import { HeroTiltCard } from "@/components/HeroTiltCard";

const FU = (delay: string) =>
  `page-fade-up 0.58s cubic-bezier(0.22,1,0.36,1) ${delay} both`;

// Glassmorphism style — semi-transparent so constellation shows through
const GLASS: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--surface-400) 76%, transparent)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid var(--border-warm)",
  boxShadow: "var(--shadow-card)",
};

export default function Home() {
  return (
    // Full-viewport positioning context so the fixed canvas covers the whole screen
    <div className="relative">

      {/* ── Constellation canvas — fixed, covers full viewport ────────────── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <ConstellationBg />
      </div>

      {/* ── Page content — above canvas ──────────────────────────────────── */}
      <div className="relative mx-auto max-w-6xl px-4 py-10" style={{ zIndex: 1 }}>
        <div className="space-y-10">

          {/* ── Hero card — glassmorphism + 3D tilt ─────────────────────────── */}
          <HeroTiltCard className="relative overflow-hidden rounded-2xl" style={GLASS}>

            {/* ── Hero body ──────────────────────────────────────────────────── */}
            <div className="space-y-8 p-6 sm:p-8">

              {/* Logo + text — text left, logo right on desktop */}
              <div className="flex flex-col-reverse gap-8 md:flex-row md:items-center md:gap-10">

                {/* Left: text + CTAs */}
                <div className="flex-1 space-y-5 min-w-0">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--brand-from)", animation: FU("0.05s") }}
                  >
                    Xin chào / Hello · TP. HCM
                  </p>

                  <h1
                    className="font-heading text-4xl font-bold sm:text-5xl"
                    style={{ letterSpacing: "-0.035em", lineHeight: 1.1, animation: FU("0.18s") }}
                  >
                    Analytics · Data platform · Credit-risk ML · GenAI
                  </h1>

                  <p
                    className="max-w-2xl text-base leading-relaxed"
                    style={{ color: "var(--foreground-secondary)", animation: FU("0.32s") }}
                  >
                    <strong style={{ color: "var(--foreground)" }}>VI:</strong> Mình là{" "}
                    <strong style={{ color: "var(--foreground)" }}>Trần Quốc Việt</strong>{" "}
                    — làm nền dữ liệu (Airflow, dbt, BigQuery, GCP), mô hình rủi ro tín
                    dụng bán lẻ (OOT, drift, scorecard / boosting), và GenAI có thể vận
                    hành (RAG, agent, observability). Trang này tổng hợp giới thiệu và
                    blog ghi chép kỹ thuật theo bốn chuyên mục.
                  </p>

                  <p
                    className="max-w-2xl text-base leading-relaxed"
                    style={{ color: "var(--foreground-secondary)", animation: FU("0.46s") }}
                  >
                    <strong style={{ color: "var(--foreground)" }}>EN:</strong> I&apos;m{" "}
                    <strong style={{ color: "var(--foreground)" }}>Tran Quoc Viet (Charlie)</strong>{" "}
                    — I work on data platforms (Airflow, dbt, BigQuery, GCP), retail
                    credit-risk ML (OOT, drift, scorecards / boosting), and
                    production-minded GenAI (RAG, agents, observability). This site is my
                    bio plus technical notes organized in four topics.
                  </p>

                  <div className="flex flex-wrap gap-3" style={{ animation: FU("0.60s") }}>
                    <Link
                      href="/about/"
                      className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                      style={{ backgroundColor: "var(--brand-from)" }}
                    >
                      About / Giới thiệu
                    </Link>
                  </div>
                </div>

                {/* Right: logo */}
                <div className="flex shrink-0 justify-center">
                  <CharlieLogoSVG size={240} />
                </div>
              </div>

              {/* Stat strip */}
              <div
                className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4"
                style={{ borderTop: "1px solid var(--border-warm)" }}
              >
                {[
                  { label: "Focus Domain", value: "Credit Risk ML" },
                  { label: "Platform",     value: "GCP · BigQuery" },
                  { label: "Stack",        value: "Airflow · dbt · RAG" },
                  { label: "Location",     value: "HCMC, Vietnam" },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="stat-card pl-3"
                    style={{ animation: FU(`${0.70 + i * 0.10}s`) }}
                  >
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--foreground-secondary)" }}>
                      {s.label}
                    </p>
                    <p className="mt-0.5 font-heading text-sm font-semibold"
                      style={{ color: "var(--foreground)" }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </HeroTiltCard>

        </div>
      </div>
    </div>
  );
}
