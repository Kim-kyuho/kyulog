// src/lib/posts.ts

import { db } from "../db";
import { blogPosts } from "../db/schema";
import { desc, eq } from "drizzle-orm";

export type PostListItem = {
  id: number;
  title: string;
  date: Date;
  category: string | null;
  tags: string | null;
  summary: string | null;
};

export async function getPostList() {
  return db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      date: blogPosts.date,
      category: blogPosts.category,
      tags: blogPosts.tags,
      summary: blogPosts.summary,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.date), desc(blogPosts.id));
}

export async function getRecentPostList(limit = 3) {
  return db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      date: blogPosts.date,
      category: blogPosts.category,
      tags: blogPosts.tags,
      summary: blogPosts.summary,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.date), desc(blogPosts.id))
    .limit(limit);
}

export async function getPostBySlug(slug: string) {
  const id = Number(slug);
  const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  return result[0];
}
