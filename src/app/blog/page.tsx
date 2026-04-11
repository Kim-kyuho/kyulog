// src/app/blog/page.tsx
import Search from "@/components/Search";
import { getPostList } from "@/lib/posts";

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPostList();

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">POST</h1>
      <Search initialPosts={posts} />
    </main>
  );
}
