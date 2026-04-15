import { notFound } from "next/navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPostBySlug, getPostList } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [session, { slug }] = await Promise.all([
    getServerSession(authOptions),
    params,
  ]);

  const [currentPost, posts] = await Promise.all([
    getPostBySlug(slug),
    getPostList(),
  ]);

  if (!currentPost) return notFound();

  const currentId = Number(slug);
  const currentIndex = posts.findIndex((p) => p.id === currentId);
  const prevPost = currentIndex >= 0 ? posts[currentIndex + 1] : undefined;
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : undefined;
  const recentPosts = posts.filter((p) => p.id !== currentId).slice(0, 3);

  return (
    <article className="max-w-3xl mx-auto py-12 px-4 prose dark:prose-invert bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-2xl shadow-md">
      <h1 className="text-3xl font-bold mb-2">{currentPost.title}</h1>
      <p className="text-sm text-muted-foreground mb-2">
        {currentPost.date.toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}{" "}
        <span className="ml-4 text-xs text-muted-foreground">
          Category:
          <span className="ml-1 text-green-800 bg-green-100 px-1.5 py-0.5 rounded-full">
            {currentPost.category}
          </span>
        </span>
      </p>
      {currentPost.tags && (
        <div className="mb-6 text-xs text-muted-foreground leading-none">
          <strong>Tag:</strong>{" "}
          {currentPost.tags.split(",").map((tag) => (
            <span
              key={tag}
              className="ml-1 text-pink-700 bg-pink-100 px-1.5 py-0.5 rounded-full"
            >
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}

      <MarkdownRenderer content={currentPost.content!} />

      {session?.user?.isAdmin && (
        <div className="flex justify-end mb-4">
          <Link
            href={`/blog/edit/${slug}`}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm active:scale-95 transition-transform"
          >
            Edit
          </Link>
        </div>
      )}

      <div className="flex justify-between font-bold drop-shadow mt-8">
        {prevPost ? (
          <Link
            href={`/blog/${prevPost.id}`}
            className="px-3 py-1 bg-sky-500 text-white font-bold rounded hover:bg-pink-500 transition duration-300 no-underline active:scale-95 transition-transform"
          >
            ← prev
          </Link>
        ) : <div />}
        {nextPost ? (
          <Link
            href={`/blog/${nextPost.id}`}
            className="px-3 py-1 bg-sky-500 text-white font-bold rounded hover:bg-pink-500 transition duration-300 no-underline active:scale-95 transition-transform"
          >
            next →
          </Link>
        ) : <div />}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">📌 Read More Posts</h2>
        <ul className="space-y-2">
          {recentPosts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.id}`}
                className="text-blue-500 hover:underline active:scale-95 transition-transform inline-block"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/blog"
          className="inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded active:scale-95 transition-transform"
        >
          View All Posts →
        </Link>
      </div>
    </article>
  );
}
