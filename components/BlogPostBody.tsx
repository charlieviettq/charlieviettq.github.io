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
import { PostLeftSidebar } from "@/components/blog/PostLeftSidebar";
import { extractToc, type TocItem } from "@/lib/bilingual-post";
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

// ─── TocNav ───────────────────────────────────────────────────────────────────
function TocNav({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Mục lục / Table of contents">
      <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        On this page
      </p>
      <ul className="space-y-2 text-sm">
        {items.map((item, index) => (
          <li
            key={`${item.id}-${index}`}
            className={item.depth === 3 ? "pl-3" : undefined}
          >
            <a
              href={`#${item.id}`}
              className="text-zinc-600 underline-offset-2 transition-colors hover:text-amber-600 hover:underline dark:text-zinc-400 dark:hover:text-amber-400"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

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
    <div className="mb-4 flex items-center justify-between border-b border-zinc-200/60 pb-2 dark:border-zinc-700/40">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {lang === "vi" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}
      </span>
      <button
        type="button"
        onClick={onToggle}
        title={open ? "Thu gọn / Collapse" : "Mở rộng / Expand"}
        className="rounded px-2 py-0.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-amber-600 dark:hover:bg-zinc-800 dark:hover:text-amber-400"
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
    "beguru-docs prose prose-zinc max-w-none dark:prose-invert prose-headings:scroll-mt-28 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-amber-400 prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-900";

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
        tocNode={<TocNav items={toc} />}
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
                className={
                  caseStudy
                    ? "mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6 lg:hidden"
                    : "mt-6 flex flex-wrap items-center gap-2 lg:hidden"
                }
                role="group"
                aria-label="Chọn ngôn ngữ / Language"
              >
                <span
                  className={
                    caseStudy
                      ? "text-xs font-medium uppercase tracking-wide text-zinc-400"
                      : "text-xs font-medium uppercase tracking-wide text-zinc-500"
                  }
                >
                  Language / Ngôn ngữ:
                </span>
                <div
                  className={
                    caseStudy
                      ? "inline-flex rounded-lg border border-white/15 bg-black/20 p-0.5"
                      : "inline-flex rounded-lg border border-zinc-200 bg-white p-0.5 shadow-sm dark:border-zinc-600 dark:bg-zinc-900"
                  }
                >
                  <button
                    type="button"
                    onClick={() => setLanguage("vi")}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                      lang === "vi"
                        ? caseStudy
                          ? "bg-white text-slate-900 shadow-sm"
                          : "bg-amber-600 text-white shadow-sm"
                        : caseStudy
                          ? "text-zinc-300 hover:text-white"
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
                        ? caseStudy
                          ? "bg-white text-slate-900 shadow-sm"
                          : "bg-amber-600 text-white shadow-sm"
                        : caseStudy
                          ? "text-zinc-300 hover:text-white"
                          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
                  >
                    English
                  </button>
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
                  onToggle={() => setViPaneOpen((o) => !o)}
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
                  onToggle={() => setEnPaneOpen((o) => !o)}
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
