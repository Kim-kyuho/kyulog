// src/components/MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";// 원하는 테마로 바꿔도 OK
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="overflow-x-auto">
      <div className="prose dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}