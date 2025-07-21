// src/app/api/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { id, title, summary, category, tags, content } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const now = new Date();

    const result = await db
      .update(blogPosts)
      .set({
        title,
        summary,
        category,
        tags: Array.isArray(tags) ? tags.join(",") : tags,
        content,
        updateDate: now,
      })
      .where(eq(blogPosts.id, Number(id)));

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Post updated successfully" });
  } catch (err) {
    console.error("DB Update Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
