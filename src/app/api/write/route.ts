export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { getAdminSession } from "@/lib/admin";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, summary, content, category, tags } = await req.json();

    if (!title || !summary || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    let tagsArray: string[] = [];
    try {
      if (typeof tags === "string") {
        tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        tagsArray = tags.map(t => String(t).trim()).filter(Boolean);
      } else {
        console.warn("Invalid tags format. Expected string or array, got:", tags);
      }
    } catch (err) {
      console.error("Error parsing tags:", err);
      tagsArray = [];
    }

    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));

    await db.insert(blogPosts).values({
      title: title.trim(),
      summary: summary.trim(),
      content,
      category: typeof category === "string" ? category.trim() : "",
      tags: tagsArray.join(","),
      date: now,
      updateDate: now,
    });

    return NextResponse.json({ message: "Success" }, { status: 201 });
  } catch (err) {
    console.error("DB Insert Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
