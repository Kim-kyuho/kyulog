// src/app/api/delete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

const REPO_OWNER = "Kim-kyuho";
const REPO_NAME = "Kim-kyuho.github.io";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const posts = await getAllPosts();
    const target = posts.find((post) => post.id === id);
    if (!target) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const slug = target.slug;
    const filePath = `posts/${slug}.md`;
    const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

    const fileRes = await fetch(githubApiUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!fileRes.ok) {
      return NextResponse.json({ error: "Failed to fetch file from GitHub" }, { status: 500 });
    }

    const fileData = await fileRes.json();
    const sha = fileData.sha;

    const deleteRes = await fetch(githubApiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete post ${slug}`,
        sha,
      }),
    });

    if (!deleteRes.ok) {
        const error = await deleteRes.json();
        return NextResponse.json({ error: error.message || "Failed to Delete to GitHub" }, { status: 500 });
    }

    return NextResponse.json({ message: "Post deleted successfully." });
  } catch (err) {
    console.error("GitHub API Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
