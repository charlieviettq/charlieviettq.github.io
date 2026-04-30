import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import rehypeSlug from "rehype-slug";
import { highlight } from "sugar-high";

import remarkDocDirectives from "@/lib/remark-doc-directives";
import { MarkdownDocAside } from "@/components/doc/MarkdownDocAside";
import { PrettyCodeBlock } from "@/components/doc/PrettyCodeBlock";
import { MermaidBlock } from "@/components/MermaidBlock";

type Props = {
  content: string;
};

function CodeBlock({
  inline,
  className,
  children,
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const raw = String(children ?? "");
  const code = raw.replace(/\n$/, "");
  const isInline =
    inline ??
    // react-markdown v10 can omit `inline` in some cases; infer from shape.
    (!className && !code.includes("\n"));

  if (isInline) {
    return <code className={className}>{children}</code>;
  }

  const lang = /language-(\w+)/.exec(className ?? "")?.[1];
  if (lang?.toLowerCase() === "mermaid") {
    return <MermaidBlock code={code} />;
  }

  const html = highlight(code);
  return <PrettyCodeBlock html={html} code={code} language={lang} />;
}

export function BlogPostBody({ content }: Props) {
  return (
    <div className="beguru-docs prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkDocDirectives]}
        rehypePlugins={[rehypeSlug]}
        components={{
          aside: (props) => <MarkdownDocAside {...props} />,
          code: (props) => <CodeBlock {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

