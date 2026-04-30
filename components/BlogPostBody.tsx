import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import rehypeSlug from "rehype-slug";
import { highlight } from "sugar-high";

import remarkDocDirectives from "@/lib/remark-doc-directives";
import { MarkdownDocAside } from "@/components/doc/MarkdownDocAside";

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

  if (inline) {
    return <code className={className}>{children}</code>;
  }

  const html = highlight(code);
  return (
    <pre className={className}>
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
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

