import { getAllPosts } from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams(): Promise<{ tag: string; page: string }[]> {
  const posts = await getAllPosts();
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags || [])));
  const POSTS_PER_PAGE = 5;

  return tags.flatMap((tag) => {
    const count = posts.filter((p) => p.tags.includes(tag)).length;
    const pages = Math.ceil(count / POSTS_PER_PAGE);
    return Array.from({ length: pages }, (_, i) => ({
      tag,
      page: String(i + 1),
    }));
  });
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string; page: string }>;
}) {
  const { tag, page } = await params;
  const currentPage = parseInt(page, 10) || 1;
  const POSTS_PER_PAGE = 5;

  const posts = await getAllPosts();
  const filtered = posts
    .filter((post) => post.tags.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (filtered.length === 0) return notFound();

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = filtered.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);

  return (
    <section className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">#{tag} 태그</h1>

      <div className="mb-6">
        <Link href="/blog/page/1" className="text-blue-500 hover:underline">
          ← 전체 글 보기
        </Link>
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

      {/* ✅ Pagination */}
      <div className="mt-8 text-center space-x-2">
        {currentPage > 1 && (
          <Link href={`/blog/tag/${tag.toLowerCase()}/page/${currentPage - 1}`} className="px-3 py-1 border rounded">
            Prev
          </Link>
        )}
        {currentPage < totalPages && (
          <Link href={`/blog/tag/${tag.toLowerCase()}/page/${currentPage + 1}`} className="px-3 py-1 border rounded">
            Next
          </Link>
        )}
      </div>
    </section>
  );
}