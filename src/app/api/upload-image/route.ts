// src/app/api/upload-image/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "画像ファイルのみアップロード可能です。" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const content = buffer.toString("base64");

  const hash = crypto.randomUUID();
  const extension = file.name.split(".").pop() || "jpg";
  const filename = `${hash}.${extension}`;
  const githubPath = `public/blog-images/${filename}`;
  const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubPath}`;

  let sha: string | undefined = undefined;

  const checkRes = await fetch(githubApiUrl, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (checkRes.ok) {
    const fileInfo = await checkRes.json();
    sha = fileInfo.sha;
  }

  const uploadRes = await fetch(githubApiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `画像 ${filename} をアップロード`,
      content,
      ...(sha && { sha }),
    }),
  });

  if (!uploadRes.ok) {
    const error = await uploadRes.json();
    return NextResponse.json({ error }, { status: 500 });
  }

  const imageUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${githubPath}`;

  return NextResponse.json({ url: imageUrl, redirectTo: "/blog" });
}
