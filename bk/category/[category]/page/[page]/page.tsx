// src/app/blog/category/[category]/page/[page]/page.tsx

import { getAllPosts } from '@/lib/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const POSTS_PER_PAGE = 5;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  const params: { category: string; page: string }[] = [];
  for (const category of categories) {
    const count = posts.filter((p) => p.category === category).length;
    const totalPages = Math.ceil(count / POSTS_PER_PAGE);
    for (let i = 1; i <= totalPages; i++) {
      params.push({ category, page: i.toString() });
    }
  }
  return params;
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string; page: string }>;
}) {
  const { category, page } = await params;
  const currentPage = parseInt(page, 10);

  const posts = await getAllPosts();
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filtered = posts.filter((post) => post.category === category);

  if (filtered.length === 0) return notFound();

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const sliced = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <section className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">{category} 카테고리의 글</h1>

      <div className="mb-6">
        <Link href="/blog/page/1" className="text-blue-500 hover:underline">
          ← 전체 글 보기
        </Link>
      </div>

      <ul className="space-y-6">
        {sliced.map((post) => (
          <li key={post.slug} className="border-b pb-4">
            <h2 className="text-xl font-semibold">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground">{post.date}</p>
            <p className="mt-2">{post.summary}</p>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      <div className="mt-10 flex space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <Link
            key={n}
            href={`/blog/category/${category}/page/${n}`}
            className={`px-3 py-1 border rounded ${n === currentPage ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
          >
            {n}
          </Link>
        ))}
      </div>
    </section>
  );
}