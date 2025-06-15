// src/lib/posts.ts

import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export type Post = {
    id: string;
    title: string;
    date: string;
    summary: string;
    slug: string;
    category: string;
    tags: string[];
  };

const postsDirectory = path.join(process.cwd(), "posts");

export async function getAllPosts() {
  const filenames = await fs.readdir(postsDirectory);

  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = await fs.readFile(filePath, "utf8");
      const { data } = matter(fileContents);

      return {
        id: data.id || "",
        title: data.title || "Untitled", 
        date: data.date || "Unknown date",
        summary: data.summary || " ",
        slug: filename.replace(/\.md$/, ""),
        category: data.category || "etc.", 
        tags: Array.isArray(data.tags) ? data.tags : [data.tags].filter(Boolean),
      };
    })
  );

  return posts;
}