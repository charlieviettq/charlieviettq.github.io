"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { MarkdownDocAside } from "@/components/doc/MarkdownDocAside";
import {
  BeguruFlowDiagram,
  parseBeguruFlowSpec,
} from "@/components/blog/BeguruFlowDiagram";
import { MermaidBlock } from "@/components/MermaidBlock";
import { CodeBlock } from "@/components/blog/CodeBlock";
import { PostLeftSidebar } from "@/components/blog/PostLeftSidebar";
import { extractToc } from "@/lib/bilingual-post";
import remarkDocDirectives from "@/lib/remark-doc-directives";
import { blogSanitizeSchema } from "@/lib/rehype-blog-sanitize";
import type { PostKpi, PostLayout } from "@/lib/posts";

const LANG_KEY = "blog-post-lang";

type Lang = "vi" | "en";

type Props = {
  title: string;
  date: string;
  excerpt?: string;
  categoryLabel: string;
  categoryPillClass: string;
  viMarkdown: string;
  enMarkdown: string;
  bilingual: boolean;
  layout: PostLayout;
  kpis: PostKpi[];
};

// ─── CaseStudyKpiGrid ─────────────────────────────────────────────────────────
function CaseStudyKpiGrid({
  kpis,
  lang,
}: {
  kpis: PostKpi[];
  lang: Lang;
}) {
  if (kpis.length === 0) return null;
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {kpis.map((kpi, i) => (
        <div
          key={`${kpi.value}-${i}`}
          className="rounded-lg border border-white/10 border-l-2 border-l-amber-400/80 bg-white/5 px-3 py-3 backdrop-blur-sm md:px-4 md:py-4"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-zinc-400">
            {lang === "vi" ? kpi.labelVi : kpi.labelEn}
          </p>
          <p className="mt-1 font-heading text-sm font-bold leading-snug text-white md:text-base">
            {kpi.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── PaneHeader ───────────────────────────────────────────────────────────────
function PaneHeader({
  lang,
  open,
  onToggle,
}: {
  lang: "vi" | "en";
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="mb-4 flex items-center justify-between rounded-lg px-3 py-2"
      style={{
        backgroundColor: "var(--surface-300)",
        border: "1px solid var(--border-warm)",
      }}
    >
      <span
        className="font-heading text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--foreground-secondary)" }}
      >
        {lang === "vi" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}
      </span>
      <button
        type="button"
        onClick={onToggle}
        title={open ? "Thu gọn / Collapse" : "Mở rộng / Expand"}
        className="rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-150"
        style={{ color: "var(--foreground-secondary)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.color = "var(--brand-from)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.color = "var(--foreground-secondary)")
        }
      >
        {open ? "← Thu" : "Mở →"}
      </button>
    </div>
  );
}

// ─── BlogPostBody ─────────────────────────────────────────────────────────────
export function BlogPostBody({
  title,
  date,
  excerpt,
  categoryLabel,
  categoryPillClass,
  viMarkdown,
  enMarkdown,
  bilingual,
  layout,
  kpis,
}: Props) {
  const [lang, setLang] = useState<Lang>("vi");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [splitView, setSplitView] = useState(false);
  const [viPaneOpen, setViPaneOpen] = useState(true);
  const [enPaneOpen, setEnPaneOpen] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "vi") setLang(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const activeMarkdown = bilingual
    ? lang === "vi"
      ? viMarkdown
      : enMarkdown
    : viMarkdown;

  const caseStudy = layout === "case-study";

  // In split mode TOC follows viMarkdown; in single mode follows activeMarkdown
  const tocSource = bilingual && splitView ? viMarkdown : activeMarkdown;
  const toc = useMemo(() => extractToc(tocSource), [tocSource]);

  // ── markdownComponents — DO NOT MODIFY THIS BLOCK ─────────────────────────
  const markdownComponents = useMemo(
    () => ({
      pre({ children }: { children?: ReactNode }) {
        const child = Children.only(children);
        if (isValidElement(child)) {
          const p = child.props as {
            className?: string;
            children?: ReactNode;
          };
          const cls = typeof p.className === "string" ? p.className : "";
          const raw = p.children;
          const text = Array.isArray(raw)
            ? raw.join("")
            : String(raw ?? "");
          if (cls.includes("language-mermaid")) {
            return <MermaidBlock chart={text} lang={lang} />;
          }
          if (cls.includes("language-beguru-flow")) {
            const spec = parseBeguruFlowSpec(text);
            if (spec) {
              return <BeguruFlowDiagram spec={spec} lang={lang} />;
            }
            return (
              <div className="my-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                <p className="font-semibold">beguru-flow: JSON không hợp lệ / Invalid JSON</p>
                <pre className="mt-2 overflow-x-auto text-xs">{text}</pre>
              </div>
            );
          }
          // Any other language-* → syntax-highlighted CodeBlock with copy button
          const langMatch = cls.match(/language-(\w[\w-]*)/);
          if (langMatch) {
            return <CodeBlock lang={langMatch[1]} code={text} />;
          }
        }
        return <pre>{children}</pre>;
      },
      aside(props: ComponentProps<"aside">) {
        const { className, children, ...rest } = props;
        if (
          typeof className === "string" &&
          className.includes("doc-callout")
        ) {
          return (
            <MarkdownDocAside className={className} {...rest}>
              {children}
            </MarkdownDocAside>
          );
        }
        return (
          <aside className={className} {...rest}>
            {children}
          </aside>
        );
      },
      hr() {
        return (
          <hr className="my-10 border-0 border-t border-dashed border-zinc-300 dark:border-zinc-600" />
        );
      },
    }),
    [lang],
  );
  // ── end markdownComponents ─────────────────────────────────────────────────

  // ── Panel safety: prevent both panes from being collapsed simultaneously ──
  const handleViToggle = () =>
    setViPaneOpen((o) => {
      const next = !o;
      if (!next && !enPaneOpen) setEnPaneOpen(true);
      return next;
    });
  const handleEnToggle = () =>
    setEnPaneOpen((o) => {
      const next = !o;
      if (!next && !viPaneOpen) setViPaneOpen(true);
      return next;
    });

  const setLanguage = (next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore */
    }
  };

  // Shared prose class string
  const proseClass =
    "beguru-docs prose prose-zinc max-w-none dark:prose-invert prose-headings:scroll-mt-28 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-amber-400";

  // Render a markdown block — reuses the same (unchanged) plugin arrays
  const renderMd = (markdown: string, key: string) => (
    <div className={proseClass}>
      <ReactMarkdown
        key={key}
        remarkPlugins={[remarkGfm, remarkDirective, remarkDocDirectives]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, blogSanitizeSchema],
          rehypeSlug,
        ]}
        components={markdownComponents}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );

  return (
    <div className="flex min-h-0 items-start">
      {/* ── LEFT SIDEBAR (desktop only) ────────────────────────────────────── */}
      <PostLeftSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        toc={toc}
        bilingual={bilingual}
        splitView={splitView}
        onSplitToggle={() => setSplitView((s) => !s)}
        lang={lang}
        onLangChange={setLanguage}
      />

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1 pl-0 lg:pl-6">
        <article className="space-y-8">
          {/* ── Post header ───────────────────────────────────────────────── */}
          <header
            className={
              caseStudy
                ? "overflow-hidden rounded-2xl border border-zinc-200/80 border-t-2 border-t-amber-400/60 bg-gradient-to-br from-[#0F172A] via-slate-900 to-purple-950 p-6 text-zinc-100 shadow-xl ring-1 ring-white/10 dark:border-zinc-700/80"
                : undefined
            }
          >
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={
                  caseStudy
                    ? "text-xs font-medium uppercase tracking-wide text-zinc-400"
                    : "text-xs font-medium uppercase tracking-wide text-zinc-500"
                }
              >
                {date}
              </p>
              <span
                className={
                  caseStudy
                    ? "inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-100 ring-1 ring-white/15"
                    : `inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryPillClass}`
                }
              >
                {categoryLabel}
              </span>
            </div>

            <h1
              className={
                caseStudy
                  ? "mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl"
                  : "mt-2 text-3xl font-bold tracking-tight"
              }
            >
              {title}
            </h1>

            {excerpt ? (
              <p
                className={
                  caseStudy
                    ? "mt-3 max-w-3xl text-base leading-relaxed text-zinc-300 md:text-lg"
                    : "mt-3 text-lg text-zinc-600 dark:text-zinc-400"
                }
              >
                {excerpt}
              </p>
            ) : null}

            {caseStudy && kpis.length > 0 ? (
              <CaseStudyKpiGrid kpis={kpis} lang={lang} />
            ) : null}

            {/* Mobile-only language toggle (sidebar hidden on mobile) */}
            {bilingual ? (
              <div
                className="mt-6 flex flex-wrap items-center gap-3 lg:hidden"
                style={caseStudy ? { borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem", marginTop: "2rem" } : {}}
                role="group"
                aria-label="Chọn ngôn ngữ / Language"
              >
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: caseStudy ? "rgba(255,255,255,0.5)" : "var(--foreground-secondary)" }}
                >
                  Language
                </span>
                <div
                  className="inline-flex rounded-full p-0.5"
                  style={{
                    backgroundColor: caseStudy ? "rgba(0,0,0,0.25)" : "var(--surface-300)",
                    border: `1px solid ${caseStudy ? "rgba(255,255,255,0.12)" : "var(--border-warm)"}`,
                  }}
                >
                  {(["vi", "en"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLanguage(l)}
                      className="rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-150"
                      style={
                        lang === l
                          ? caseStudy
                            ? { backgroundColor: "#ffffff", color: "#1a1814" }
                            : { backgroundColor: "var(--brand-from)", color: "#ffffff", boxShadow: "0 1px 4px rgba(245,78,0,0.3)" }
                          : { backgroundColor: "transparent", color: caseStudy ? "rgba(255,255,255,0.6)" : "var(--foreground-secondary)" }
                      }
                    >
                      {l === "vi" ? "Tiếng Việt" : "English"}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </header>

          {/* ── Content area ──────────────────────────────────────────────── */}
          {splitView && bilingual ? (
            /* ── SPLIT VIEW: VI | EN side by side (desktop) ──────────────── */
            <div className="flex items-start gap-0 lg:gap-2">
              {/* VI pane */}
              <div
                className={
                  viPaneOpen
                    ? "min-w-0 flex-1 overflow-x-auto"
                    : "w-auto shrink-0"
                }
              >
                <PaneHeader
                  lang="vi"
                  open={viPaneOpen}
                  onToggle={handleViToggle}
                />
                {viPaneOpen && renderMd(viMarkdown, "vi")}
              </div>

              {/* Vertical divider between panes */}
              {viPaneOpen && enPaneOpen && (
                <div className="mx-3 hidden w-px self-stretch shrink-0 bg-zinc-200/70 dark:bg-zinc-700/50 lg:block" />
              )}

              {/* EN pane */}
              <div
                className={
                  enPaneOpen
                    ? "min-w-0 flex-1 overflow-x-auto"
                    : "w-auto shrink-0"
                }
              >
                <PaneHeader
                  lang="en"
                  open={enPaneOpen}
                  onToggle={handleEnToggle}
                />
                {enPaneOpen && renderMd(enMarkdown, "en")}
              </div>
            </div>
          ) : caseStudy ? (
            /* ── SINGLE VIEW — case-study card wrapper ────────────────────── */
            <div className="rounded-2xl border border-zinc-200/90 bg-white/90 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950/50 md:p-8">
              {renderMd(activeMarkdown, lang + (bilingual ? "" : "single"))}
            </div>
          ) : (
            /* ── SINGLE VIEW — default prose ──────────────────────────────── */
            renderMd(activeMarkdown, lang + (bilingual ? "" : "single"))
          )}
        </article>
      </div>
    </div>
  );
}
