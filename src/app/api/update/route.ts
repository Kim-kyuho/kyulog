// src/app/api/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

const REPO_OWNER = process.env.REPO_OWNER || "Kim-kyuho";
const REPO_NAME = process.env.REPO_NAME || "Kim-kyuho.github.io";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

export async function POST(req: NextRequest) {
  try {
    const { id, title, summary, category, tags, content } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // find existing post by id
    const posts = await getAllPosts();
    const target = posts.find((p) => p.id === id);
    if (!target) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const slug = target.slug;
    const path = `posts/${slug}.md`;
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

    // fetch current file to get sha
    const fileRes = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    });
    if (!fileRes.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
    }
    const fileData = await fileRes.json();
    const sha = fileData.sha;

    // build new markdown
    const tagLines = tags.map((t: string) => `- "${t}"`).join("\n");
    const now = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Tokyo" }).replace("T", " ");
    const date = now;
    const markdown = `---\nid: "${id}"\ntitle: "${title}"\ndate: "${date}"\nsummary: "${summary}"\ncategory: "${category}"\ntags:\n${tagLines}\n---\n\n${content}`;

    // update via GitHub API
    const updateRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: `Update post ${slug}`, content: btoa(unescape(encodeURIComponent(markdown))), sha })
    });

    if (!updateRes.ok) {
      const err = await updateRes.json();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    return NextResponse.json({ message: "Post updated successfully" });
  } catch (err) {
    console.error("GitHub API Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
