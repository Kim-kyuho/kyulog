// src/app/api/upload-image/route.ts

import { NextRequest, NextResponse } from "next/server";

const REPO_OWNER = "Kim-kyuho";
const REPO_NAME = "Kim-kyuho.github.io";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "画像ファイルのみアップロード可能です。" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const content = buffer.toString("base64");

  const hash = Buffer.from(file.name + Date.now()).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
  const extension = file.name.split(".").pop() || "jpg";
  const filename = `${hash}.${extension}`;
  const githubPath = `public/blog-images/${filename}`;
  const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubPath}`;

  const uploadRes = await fetch(githubApiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `画像 ${filename} をアップロード`,
      content,
    }),
  });

  if (!uploadRes.ok) {
    const error = await uploadRes.json();
    return NextResponse.json({ error }, { status: 500 });
  }

  const imageUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/master/${githubPath}`;
  return NextResponse.json({ url: imageUrl, redirectTo: "/blog" });
}
