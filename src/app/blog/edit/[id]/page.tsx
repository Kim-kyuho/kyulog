// src/app/blog/edit/[id]/page.tsx

import { notFound } from "next/navigation";
import { db } from "@/db/index";
import { blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

import EditClient from "./EditClient";
import type { PostFormData } from "@/app/types/write";

interface EditPageProps {
  params: { id: string };
}

export default async function EditPage({ params }: EditPageProps) {
  const id = Number(params.id);

  try {
    const post = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, id),
    });

    if (!post) return notFound();

    const initialData: PostFormData = {
      id: post.id.toString(),
      title: post.title ?? "",
      summary: post.summary ?? "",
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
      category: post.category ?? "",
      content: post.content ?? "",
    };

    return <EditClient initialData={initialData} />;
  } catch (e) {
    console.error("Failed to load post from DB:", e);
    return notFound();
  }
}