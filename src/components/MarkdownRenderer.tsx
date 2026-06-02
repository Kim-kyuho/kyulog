// src/components/MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import MermaidDiagram from "@/components/MermaidDiagram";

const components: Components = {
  pre({ children, ...props }) {
    if (
      React.isValidElement(children) &&
      typeof children.props === "object" &&
      children.props !== null &&
      "className" in children.props &&
      typeof children.props.className === "string" &&
      children.props.className.split(" ").includes("language-mermaid")
    ) {
      return <>{children}</>;
    }

    return <pre {...props}>{children}</pre>;
  },
  code({ className, children, ...props }) {
    if (className?.split(" ").includes("language-mermaid")) {
      return <MermaidDiagram chart={String(children).replace(/\n$/, "")} />;
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-renderer overflow-x-auto">
      <div className="prose max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            [rehypeHighlight, { plainText: ["mermaid"] }],
            rehypeSlug,
            rehypeAutolinkHeadings,
          ]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
