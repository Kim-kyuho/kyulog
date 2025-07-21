// src/lib/posts.ts

import { db } from "../db";
import { blogPosts } from "../db/schema";
import { eq } from "drizzle-orm";

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

export async function getPostBySlug(slug: string) {
  const id = Number(slug); // slug는 문자열이므로 number로 변환
  const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  return result[0];
}