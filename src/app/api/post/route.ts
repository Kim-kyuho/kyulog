// src/app/api/post/route.ts
import { NextResponse } from "next/server";
import { getPostList } from "@/lib/posts";

export async function GET() {
  try {
    const posts = await getPostList();
    return NextResponse.json(posts);
  } catch (err) {
    console.error("DB fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
