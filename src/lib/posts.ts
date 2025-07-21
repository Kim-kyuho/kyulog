// src/lib/posts.ts

import { db } from "../db";
import { blogPosts } from "../db/schema";

export type Post = {
    id: number;
    title: string;
    date: string;
    summary: string;
    slug: string;
    category: string;
    tags: string[];
  };

export async function getAllPosts() {
  const result = await db.select().from(blogPosts).orderBy(blogPosts.id);
  return result;
}