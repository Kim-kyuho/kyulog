// src/app/api/post/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { blogPosts } from "@/db/schema";

export async function GET() {
  try {
    const posts = await db.select().from(blogPosts);
    return NextResponse.json(posts);
  } catch (err) {
    console.error("DB fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}