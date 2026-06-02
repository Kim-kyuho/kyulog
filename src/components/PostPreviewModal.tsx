"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { BLOG_ARTICLE_CLASS_NAME } from "@/lib/blogStyles";

type PostPreviewModalProps = {
  content: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function PostPreviewModal({
  content,
  isOpen,
  onClose,
}: PostPreviewModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Post preview"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-20"
      style={{
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        inset: 0,
        justifyContent: "center",
        position: "fixed",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[calc(100vh-10rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white/95 shadow-xl dark:bg-gray-900/95"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-lg font-bold leading-none text-white shadow-md hover:bg-gray-700 active:scale-95 transition-transform"
        >
          ×
        </button>
        <article className={`${BLOG_ARTICLE_CLASS_NAME} min-h-32 w-full overflow-y-auto rounded-2xl pr-12`}>
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p className="text-sm text-gray-500">Markdown preview will appear here.</p>
          )}
        </article>
      </div>
    </div>,
    document.body,
  );
}
