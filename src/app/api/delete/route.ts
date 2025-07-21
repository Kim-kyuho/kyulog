// src/app/api/delete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const deleted = await db.delete(blogPosts).where(eq(blogPosts.id, id));

    return NextResponse.json({ message: "Post deleted successfully." });
  } catch (err) {
    console.error("DB Delete Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
