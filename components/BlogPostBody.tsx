"use client";

import Link from "next/link";
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
import { MermaidBlock } from "@/components/MermaidBlock";
import { extractToc, type TocItem } from "@/lib/bilingual-post";
import remarkDocDirectives from "@/lib/remark-doc-directives";
import { blogSanitizeSchema } from "@/lib/rehype-blog-sanitize";

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
};

function TocNav({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Mục lục / Table of contents">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
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
              className="text-zinc-600 underline-offset-2 hover:text-sky-600 hover:underline dark:text-zinc-400 dark:hover:text-sky-400"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function BlogPostBody({
  title,
  date,
  excerpt,
  categoryLabel,
  categoryPillClass,
  viMarkdown,
  enMarkdown,
  bilingual,
}: Props) {
  const [lang, setLang] = useState<Lang>("vi");

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

  const toc = useMemo(() => extractToc(activeMarkdown), [activeMarkdown]);

  const markdownComponents = useMemo(
    () => ({
      pre({ children }: { children?: ReactNode }) {
        const child = Children.only(children);
        if (isValidElement(child)) {
          const p = child.props as {
            className?: string;
            children?: ReactNode;
          };
          if (
            typeof p.className === "string" &&
            p.className.includes("language-mermaid")
          ) {
            const raw = p.children;
            const chart = Array.isArray(raw)
              ? raw.join("")
              : String(raw ?? "");
            return <MermaidBlock chart={chart} />;
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
    [],
  );

  const setLanguage = (next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <div className="order-1 min-w-0 flex-1 lg:order-2">
        <article className="space-y-8">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {date}
              </p>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryPillClass}`}
              >
                {categoryLabel}
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
            {excerpt ? (
              <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
                {excerpt}
              </p>
            ) : null}

            {bilingual ? (
              <div
                className="mt-6 flex flex-wrap items-center gap-2"
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
            ) : null}
          </header>

          <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:scroll-mt-28 prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-sky-400 prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-900">
            <ReactMarkdown
              key={lang + (bilingual ? "" : "single")}
              remarkPlugins={[remarkGfm, remarkDirective, remarkDocDirectives]}
              rehypePlugins={[
                rehypeRaw,
                [rehypeSanitize, blogSanitizeSchema],
                rehypeSlug,
              ]}
              components={markdownComponents}
            >
              {activeMarkdown}
            </ReactMarkdown>
          </div>
        </article>

        <p className="mt-10 text-sm">
          <Link href="/blog/" className="text-sky-600 hover:underline dark:text-sky-400">
            ← Blog
          </Link>
        </p>
      </div>

      <aside className="order-2 w-full shrink-0 border-t border-zinc-200 pt-6 lg:order-1 lg:w-56 lg:border-r lg:border-t-0 lg:pr-6 dark:border-zinc-700">
        <div className="lg:sticky lg:top-24">
          <TocNav items={toc} />
        </div>
      </aside>
    </div>
  );
}
