// src/app/blog/page.tsx
import Search from "@/components/Search";

export default function BlogPage() {
  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">POST</h1>
      <Search />
    </main>
  );
}