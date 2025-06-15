// scripts/generate-posts-json.ts
import fs from "fs";
import path from "path";
import { getAllPosts } from "../src/lib/posts";

async function generate() {
  const posts = await getAllPosts();

  // 요약 정보만 저장 (id, slug, title, summary 등)
  const minimalPosts = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    date: post.date,
    category: post.category,
    tags: post.tags,
  }));

  const outputPath = path.join(process.cwd(), "public", "posts.json");
  fs.writeFileSync(outputPath, JSON.stringify(minimalPosts, null, 2), "utf-8");
  console.log(`✅ posts.json 생성 완료: ${outputPath}`);
}

generate();