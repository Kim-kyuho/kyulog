// Search.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Post = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  date: string;
  category?: string;
  tags?: string[];
};

export default function Search() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTags, setShowTags] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/posts.json")
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
      if (tagRef.current && !tagRef.current.contains(event.target as Node)) {
        setShowTags(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uniqueTags = Array.from(new Set(posts.flatMap((p) => p.tags || [])));
  const uniqueCategories = Array.from(
    new Set(posts.map((p) => p.category).filter((cat): cat is string => !!cat))
  );

  const filtered = posts.filter((post) => {
    const matchesQuery =
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.summary?.toLowerCase().includes(query.toLowerCase());
    const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    return matchesQuery && matchesTag && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const POSTS_PER_PAGE = 5;
  const totalPages = Math.ceil(sorted.length / POSTS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto px-4 sm:px-2 py-2">
      <div className="w-full bg-white shadow p-4 rounded-xl dark:bg-gray-800 dark:shadow-white/10">
        {/* Search Input */}
        <div className="space-y-1 mb-6">
          <div className="relative mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search..."
              className="w-full p-2 pr-10 bg-gray-100 border border-gray-300 rounded-full"
            />
            <button
              onClick={() => setQuery(inputValue)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black active:scale-95 transition-transform"
              aria-label="Search"
            >
              🔍
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Category Filter */}
            <div ref={categoryRef}>
              <label className="font-semibold text-green-700 mr-2">Category:</label>
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setShowCategories(!showCategories)}
                  className="inline-flex items-center justify-center gap-x-1.5 rounded-md bg-white px-2 py-1.5 text-sm font-semibold text-green-900 shadow-sm ring-1 ring-green-300 hover:bg-green-50 dark:hover:bg-white active:scale-95 transition-transform"
                >
                  {selectedCategory || "Category"} ▼
                </button>
                {showCategories && (
                  <div className="absolute z-10 mt-1 w-44 rounded-md bg-white ring-1 ring-gray-300 focus:outline-none">
                    <div className="py-1">
                      <button
                        onClick={() => { setSelectedCategory(null); setShowCategories(false); }}
                        className="block w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 dark:hover:bg-white active:scale-95 transition-transform"
                      >All</button>
                      {uniqueCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { setSelectedCategory(cat); setShowCategories(false); }}
                          className="block w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 dark:hover:bg-white active:scale-95 transition-transform"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tag Filter */}
            <div ref={tagRef}>
              <label className="font-semibold text-red-600 mr-2">Tag:</label>
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setShowTags(!showTags)}
                  className="inline-flex items-center justify-center gap-x-1.5 rounded-md bg-white px-2 py-1.5 text-sm font-semibold text-red-900 shadow-sm ring-1 ring-pink-300 hover:bg-pink-50 dark:hover:bg-white active:scale-95 transition-transform"
                >
                  {selectedTag || "Tag"} ▼
                </button>
                {showTags && (
                  <div className="absolute z-10 mt-1 w-44 rounded-md bg-white ring-1 ring-gray-300 focus:outline-none">
                    <div className="py-1">
                      <button
                        onClick={() => { setSelectedTag(null); setShowTags(false); }}
                        className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-pink-50 dark:hover:bg-white active:scale-95 transition-transform"
                      >All</button>
                      {uniqueTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => { setSelectedTag(tag); setShowTags(false); }}
                          className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-pink-50 dark:hover:bg-white active:scale-95 transition-transform"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post list */}
      <div className="w-full bg-white shadow p-4 rounded-xl dark:bg-gray-800 dark:shadow-white/10">
        <ul className="space-y-4">
          {paginated.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block bg-white dark:bg-white/5 p-4 rounded-xl border border-white/70 dark:border-white/20 shadow-xs duration-300 hover:bg-lime-300 dark:hover:bg-white/5 hover:shadow-lime-200 dark:hover:shadow-none active:scale-95 transition-transform"
              >
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-white hover:underline">{post.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    {post.date}
                    {post.category && (
                      <span className="ml-2 text-green-800 bg-green-100 px-2 py-1 rounded-full text-xs">
                        {post.category}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-100 mt-2">{post.summary}</p>
                  {post.tags && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs text-pink-700 bg-pink-100 px-2 py-1 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>

              {session?.user?.isAdmin && (
                <button
                  className="ml-4 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 mt-3 active:scale-95 transition-transform"
                  onClick={async () => {
                    const confirmed = confirm(`Are you sure you want to delete "${post.title}"?`);
                    if (!confirmed) return;
                    const res = await fetch("/api/delete", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: post.id }),
                    });
                    if (res.ok) {
                      alert("Post deleted successfully!");
                      location.reload();
                    } else {
                      const error = await res.json();
                      alert("Failed to delete post: " + JSON.stringify(error));
                    }
                  }}
                >
                  delete
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* New Post & Pagination */}
        <div className="text-right mt-4">
          {session?.user?.isAdmin && (
            <Link
              href="/blog/write"
              className="inline-block bg-blue-200 text-blue-900 font-medium px-4 py-2 rounded hover:bg-blue-300 transition"
            >
              New Post
            </Link>
          )}
        </div>

        <div className="flex gap-2 justify-center mt-6 items-center">
          {currentPage > 1 && (
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm bg-pink-100 text-pink-800 hover:bg-pink-200 active:scale-95 transition-transform"
            >
              ←
            </button>
          )}
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition ${
                currentPage === i + 1
                  ? "bg-green-300 text-green-950 shadow-green-200 font-semibold"
                  : "bg-white text-black shadow-xl dark:bg-gray-800 dark:text-white hover:bg-green-200 dark:hover:bg-gray-800"
              } active:scale-95 transition-transform`}
            >
              {i + 1}
            </button>
          ))}
          {currentPage < totalPages && (
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm bg-pink-100 text-pink-800 hover:bg-pink-200 active:scale-95 transition-transform"
            >
              →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}