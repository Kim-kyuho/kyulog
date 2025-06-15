import { getAllPosts } from "@/lib/posts";
import Search from "@/components/Search";
import Link from "next/link";
import { notFound } from "next/navigation";

const POSTS_PER_PAGE = 5;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  return Array.from({ length: totalPages }, (_, i) => ({ page: String(i + 1) }));
}

export default async function BlogPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const currentPage = parseInt(page, 10);

  const allPosts = await getAllPosts();
  const posts = allPosts.sort((a, b) => b.date.localeCompare(a.date));

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  if (posts.length > 0 && paginatedPosts.length === 0) return notFound();

  return (
    <section className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Page {currentPage}</h1>
      <Search />

      {/* ✅ 카테고리 필터 */}
      <div className="mb-4 space-x-2">
        <span className="font-semibold">Category:</span>
        <Link href="/blog/page/1" className="px-2 py-1 border rounded">All</Link>
        {Array.from(new Set(posts.map((p) => p.category))).map((cat) => (
          <Link
            key={cat}
            href={`/blog/category/${cat}/page/1`}
            className="px-2 py-1 border rounded"
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* ✅ 태그 필터 */}
      <div className="mb-8 space-x-2">
        <span className="font-semibold">Tags:</span>
        {Array.from(new Set(posts.flatMap((p) => p.tags))).map((tag) => (
          <Link
            key={tag}
            href={`/blog/tag/${tag.toLowerCase()}/page/1`}
            className="inline-block px-2 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            #{tag}
          </Link>
        ))}
      </div>

      {/* 전체 페이지 네비게이션 */}
      <div className="mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <Link
            key={i + 1}
            href={`/blog/page/${i + 1}`}
            className={`px-2 py-1 border rounded ${i + 1 === currentPage ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
          >
            {i + 1}
          </Link>
        ))}
      </div>

      <ul className="space-y-6">
        {paginatedPosts.map((post) => (
          <li key={post.slug} className="border-b pb-4">
            <h2 className="text-xl font-semibold">
              <Link href={`/blog/${post.slug.toLowerCase()}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground">{post.date}</p>
            <p className="mt-2">{post.summary}</p>
          </li>
        ))}
      </ul>

      {/* Pagination links */}
      <div className="mt-8 space-x-2">
        {currentPage > 1 && (
          <Link href={`/blog/page/${currentPage - 1}`} className="px-2 py-1 border rounded">
            Previous
          </Link>
        )}
        {startIndex + POSTS_PER_PAGE < posts.length && (
          <Link href={`/blog/page/${currentPage + 1}`} className="px-2 py-1 border rounded">
            Next
          </Link>
        )}
      </div>
    </section>
  );
}
