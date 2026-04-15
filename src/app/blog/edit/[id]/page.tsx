// src/app/blog/edit/[id]/page.tsx

import { notFound, redirect } from "next/navigation";
import EditClient from "./EditClient";
import type { PostFormData } from "@/app/types/write";
import { getAdminSession } from "@/lib/admin";

// 追加: DBアクセス用
import { db } from "@/db/index";
import { blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/blog");
  }

  const idParam = await params;
  const id = parseInt(idParam.id, 10);

  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id));

  const post = result[0];

  if (!post) {
    return notFound();
  }

  const initialData: PostFormData = {
    id: String(post.id),
    title: post.title || "",
    summary: post.summary || "",
    tags: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "",
    category: post.category || "",
    content: post.content || "",
  };

  return <EditClient initialData={initialData} />;
}
