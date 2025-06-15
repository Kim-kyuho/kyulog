"use client";
import type { WritePageProps } from "@/app/types/write";
import { useState, useRef, useEffect } from "react";

// Internal component handling write/edit logic
export default function WritePage({ initialData, isEditMode = false }: WritePageProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize states if in edit mode
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSummary(initialData.summary);
      setContent(initialData.content);
      setTags(initialData.tags);
      setCategory(initialData.category);
      // Set id if provided
      (function() { /* no direct setter for id, it's read-only */ })();
    }
  }, [initialData]);

  const validateForm = () => {
    if (!title || !summary || !content) {
      setErrorMessage("タイトル、概要、本文をすべて入力してください。");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setIsPublishing(true);

    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const endpoint = isEditMode ? "/api/update" : "/api/write";
      const payload = {
        id: isEditMode ? initialData?.id : undefined,
        title,
        summary,
        content,
        tags: tagArray,
        category,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (isEditMode) {
          setSuccessMessage("✅ 更新成功！");
          window.location.href = "https://kyulog.vercel.app/blog/";
        } else {
          setSuccessMessage("✅ アップロード成功！");
          window.location.href = "https://kyulog.vercel.app/blog/";
        }
        setTitle("");
        setSummary("");
        setContent("");
        setTags("");
        setCategory("");
      } else {
        const errorText = await res.json(); // 응답을 JSON으로 처리
        setErrorMessage(`❌ アップロード失敗...\n${JSON.stringify(errorText)}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(`❌ ネットワークエラー: ${error.message}`);
      } else {
        setErrorMessage("❌ 不明なエラーが発生しました");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-sky-200/40 backdrop-blur-md rounded-2xl shadow-md">
      <h1 className="text-3xl font-bold mb-4">✍️ Create a New Blog Post</h1>

      <div>
        <label className="block font-semibold mb-1">Post Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded bg-white/80 dark:text-gray-700"
          placeholder="Enter the title"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Post Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full p-2 border rounded bg-white/80 dark:text-gray-700"
          placeholder="Write a short summary"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Tags (comma-separated)</label>
        <textarea
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-2 border rounded bg-white/80 dark:text-gray-700"
          placeholder="e.g. react, nextjs, typescript"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Post Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded bg-white/80 dark:text-gray-700"
          placeholder="Enter category"
        />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={async (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (!file || !file.type.startsWith("image/")) return alert("Only image files are allowed!");

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload-image", {
              method: "POST",
              body: formData,
            });

            if (res.ok) {
              const { url } = await res.json();
              const textarea = textareaRef.current;
              if (!textarea) return;

              const cursorPos = textarea.selectionStart;
              const before = content.slice(0, cursorPos);
              const after = content.slice(cursorPos);
              setContent(`${before}\n\n![image](${url})\n\n${after}`);
            } else {
              alert("Image upload failed 😢");
            }
          }}
          className="flex-1 border-2 border-dashed border-gray-300 rounded p-6 text-center text-sm text-gray-700 hover:border-blue-400"
        >
          Drag and drop an image here
        </div>

        <div className="w-40">
          <label className="block font-bold text-white bg-orange-500 px-3 py-1 rounded mb-1 text-center">
            Select Image File
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !file.type.startsWith("image/")) return alert("Only image files can be uploaded!");

              const formData = new FormData();
              formData.append("file", file);

              const res = await fetch("/api/upload-image", {
                method: "POST",
                body: formData,
              });

              if (res.ok) {
                const { url } = await res.json();
                const textarea = textareaRef.current;
                if (!textarea) return;
                const cursorPos = textarea.selectionStart;
                const before = content.slice(0, cursorPos);
                const after = content.slice(cursorPos);
                setContent(`${before}\n\n![image](${url})\n\n${after}`);
              } else {
                alert("Image upload failed 😢");
              }

              e.target.value = "";
            }}
            className="block w-full"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1">Post Body (Markdown)</label>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-60 p-2 border rounded bg-white/80 dark:text-gray-700"
          placeholder="Write your post in markdown..."
        />
      </div>

      {errorMessage && <div className="text-red-500 font-medium">{errorMessage}</div>}
      {successMessage && <div className="text-green-600 font-medium">{successMessage}</div>}

      <button
        onClick={handlePublish}
        disabled={isPublishing}
        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-pink-600 disabled:opacity-50 active:scale-95 transition-transform"
      >
        {isPublishing 
          ? isEditMode 
            ? "更新中..." 
            : "アップロード中..." 
          : isEditMode 
            ? "Update Post" 
            : "Publish to GitHub"}
      </button>
    </div>
  );
 }

// Page component for /blog/write route는 pages 디렉토리에서 정의되어야 함으로 제거
