// src/app/blog/edit/[id]/page.tsx

import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

// 1) 클라이언트 컴포넌트인 EditClient import
import EditClient from "./EditClient";
// 2) 타입 선언 import
import type { PostFormData } from "@/app/types/write";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params;
  const filePath = path.join(process.cwd(), "posts", `${id}.md`);

  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(fileContent);

    // 3) PostFormData 타입으로 initialData 구성
    const initialData: PostFormData = {
      id,
      title: data.title || "",
      summary: data.summary || "",
      tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || "",
      category: data.category || "",
      content: content || "",
    };

    // 4) 클라이언트 컴포넌트에 props로 넘겨 렌더링
    return <EditClient initialData={initialData} />;
  } catch (e) {
    console.error("Failed to load markdown for editing:", e);
    return notFound();
  }
}