# Blog DB Performance and Build Report

Date: 2026-04-11
Project: `kyulog`

## 1. Summary

This document records:

- why the blog list became slow after switching to Neon database access
- which source files were changed to improve performance
- which build/deploy problems occurred afterward
- the root cause and resolution for each issue

## 2. Blog List Performance Problem

### Symptom

- After moving blog post data loading to Neon DB, the blog list page became noticeably slower.
- The slowdown was especially visible on the board/list page before posts appeared.

### Root Causes

#### Cause 1. Client-side fetch after mount

File:

- [`src/components/Search.tsx`](./src/components/Search.tsx)

Original behavior:

- The blog page rendered the client component first.
- After mount, the client called `fetch("/api/post")`.
- That added an extra round trip:
  - browser
  - Next.js API route
  - Neon database

Why it was slow:

- Compared to static/local JSON loading, the page had to wait for runtime network I/O before showing post data.
- With a cloud DB, latency becomes visible immediately.

#### Cause 2. List API returned full rows including post body content

File:

- [`src/app/api/post/route.ts`](./src/app/api/post/route.ts)

Original behavior:

```ts
const posts = await db.select().from(blogPosts);
```

Why it was slow:

- This returned every column in `blog_posts`.
- The schema included a large `content` field.
- The blog list only needed metadata, not the full markdown body.
- Larger payload meant:
  - slower DB response
  - more serialization work
  - larger JSON transfer
  - more client parsing cost

Related schema:

- [`src/db/schema.ts`](./src/db/schema.ts)

```ts
content: text("content"),
```

#### Cause 3. Several pages were over-fetching full post data

Files:

- [`src/lib/posts.ts`](./src/lib/posts.ts)
- [`src/app/page.tsx`](./src/app/page.tsx)
- [`src/app/blog/[slug]/page.tsx`](./src/app/blog/[slug]/page.tsx)

Original pattern:

- full-table reads used for homepage latest posts
- full-table reads used for detail-page adjacent/recent navigation

Why it was slow:

- metadata-only screens still loaded more data than needed
- this increased DB load and response time

## 3. Performance Fixes Applied

### A. Split list queries from detail queries

Updated file:

- [`src/lib/posts.ts`](./src/lib/posts.ts)

What changed:

- removed the old broad list access pattern
- added lightweight list query helpers:
  - `getPostList()`
  - `getRecentPostList(limit)`
- kept `getPostBySlug(slug)` for full post detail

Current approach:

```ts
export async function getPostList() {
  return db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      date: blogPosts.date,
      category: blogPosts.category,
      tags: blogPosts.tags,
      summary: blogPosts.summary,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.date), desc(blogPosts.id));
}
```

Improvement:

- `content` is no longer returned for list views

### B. Stop client-side post fetching on the blog list page

Updated files:

- [`src/app/blog/page.tsx`](./src/app/blog/page.tsx)
- [`src/components/Search.tsx`](./src/components/Search.tsx)

What changed:

- the blog page became an async server component
- the server loads the post list first
- the result is passed into `Search` as `initialPosts`
- the old `fetch("/api/post")` logic was removed

Old pattern:

```ts
useEffect(() => {
  const fetchPosts = async () => {
    const res = await fetch("/api/post");
    const data = await res.json();
    setPosts(parsed);
  };
  fetchPosts();
}, []);
```

New pattern:

```ts
export default async function BlogPage() {
  const posts = await getPostList();
  return <Search initialPosts={posts} />;
}
```

Improvement:

- removed one runtime fetch step from the user-facing path
- posts are available on first render

### C. Add short revalidation for repeated reads

Updated files:

- [`src/app/blog/page.tsx`](./src/app/blog/page.tsx)
- [`src/app/page.tsx`](./src/app/page.tsx)

Added:

```ts
export const revalidate = 60;
```

Improvement:

- repeated requests do not always hit the database immediately

### D. Reduce unnecessary full reads on homepage and detail page

Updated files:

- [`src/app/page.tsx`](./src/app/page.tsx)
- [`src/app/blog/[slug]/page.tsx`](./src/app/blog/[slug]/page.tsx)

What changed:

- homepage now uses `getRecentPostList(3)`
- detail page uses:
  - `getPostBySlug(slug)` for the current post content
  - `getPostList()` for lightweight navigation metadata

Improvement:

- full content is only fetched where actually needed

## 4. Files Changed for the DB Performance Fix

- [`src/lib/posts.ts`](./src/lib/posts.ts)
- [`src/app/api/post/route.ts`](./src/app/api/post/route.ts)
- [`src/components/Search.tsx`](./src/components/Search.tsx)
- [`src/app/blog/page.tsx`](./src/app/blog/page.tsx)
- [`src/app/page.tsx`](./src/app/page.tsx)
- [`src/app/blog/[slug]/page.tsx`](./src/app/blog/[slug]/page.tsx)

## 5. Build Problems That Appeared

After the refactor, several build-related issues appeared.

### Problem 1. Removed export still referenced in build script

Error:

```txt
scripts/generate-posts-json.ts(4,10): error TS2305:
Module '"../src/lib/posts"' has no exported member 'getAllPosts'.
```

Affected file:

- [`scripts/generate-posts-json.ts`](./scripts/generate-posts-json.ts)

Cause:

- `getAllPosts()` had been removed from [`src/lib/posts.ts`](./src/lib/posts.ts)
- but the prebuild script still imported and called it

Old code:

```ts
import { getAllPosts } from "../src/lib/posts";
const posts = await getAllPosts();
```

Fix:

- replaced `getAllPosts()` with `getPostList()`

New code:

```ts
import { getPostList } from "../src/lib/posts";
const posts = await getPostList();
```

Resolution:

- Vercel build no longer fails on that missing export in `scripts/**/*`

### Problem 2. Next.js vulnerable version blocked by Vercel

Warning:

```txt
Error: Vulnerable version of Next.js detected, please update immediately.
```

Cause:

- the project was using a vulnerable Next.js version
- Vercel’s security bulletin required an upgrade to a patched release

Project state at the time:

- `package.json` had `next` on an affected version line

Resolution:

- update `next` to a patched version
- reinstall dependencies
- redeploy

Recommended process:

```bash
npm install next@15.3.6
npm install
npm run build
```

Note:

- later local package state showed `next` had already moved to `^15.5.15`, which is outside the specifically cited `15.3.x` vulnerable patch line and should be validated together with the deployed lockfile

### Problem 3. tsconfig issues and editor/build confusion

Affected file:

- [`tsconfig.json`](./tsconfig.json)

Problems observed:

- `typeRoots` pointed to `./types`, but that directory did not exist
- actual type declaration files were under `src/app/types`
- `moduleResolution` was set to `"node"` rather than `"bundler"`
- `baseUrl` caused continued editor confusion, even though it was valid JSON/TS syntax

Fixes applied:

- changed:

```json
"moduleResolution": "node"
```

to:

```json
"moduleResolution": "bundler"
```

- removed:

```json
"typeRoots": ["./types", "./node_modules/@types"]
```

- removed:

```json
"baseUrl": "."
```

Why:

- `typeRoots` was constraining type discovery without matching the real project layout
- `bundler` is the better fit for a modern Next.js setup
- `baseUrl` was not required for this project’s current alias structure and removing it simplified the config

## 6. Additional Runtime/Local Environment Issue

### Docker module resolution issue

Error:

```txt
Module not found: Can't resolve '@neondatabase/serverless'
```

Cause:

- local machine had the dependency installed
- Docker image/volume layout caused stale `node_modules` inside the container

Relevant files:

- [`Dockerfile`](./Dockerfile)
- [`docker-compose.yml`](./docker-compose.yml)

Likely reason:

- image installed dependencies
- bind mount `.:/app` overlaid the app directory
- `/app/node_modules` was backed by an old anonymous Docker volume
- newly added packages were missing in the running container

Recommended fix:

```bash
docker compose down -v
docker compose up -d --build
```

## 7. Production Upload Issue Analysis

### Symptom

- image upload worked differently or failed in service/production environment

Affected files:

- [`src/app/api/upload-image/route.ts`](./src/app/api/upload-image/route.ts)
- [`src/components/WritePage.tsx`](./src/components/WritePage.tsx)

Likely causes:

1. missing production environment variables
   - `GITHUB_TOKEN`
   - `REPO_OWNER`
   - `REPO_NAME`
2. GitHub token missing `Contents: write` permission
3. image URL assumed `main` branch even if the real default branch differed
4. large uploads may hit serverless request/body/runtime limits
5. failure responses were collapsed into a generic 500, making diagnosis harder

Recommended fixes:

- validate required env vars at runtime
- preserve GitHub status/body in error responses
- add configurable branch env var
- enforce a file size limit before upload

## 8. Final Outcome

### Performance result

- blog list no longer waits for a client-side fetch after mount
- list responses no longer include full post content
- homepage and detail page load less unnecessary data
- short caching/revalidation reduces repeated DB load

### Build stability result

- build script was updated to the new posts API
- `tsconfig.json` was simplified for the actual project structure
- Next.js security version issue was identified and upgrade action was defined

## 9. Main Files Touched During the Work

- [`src/lib/posts.ts`](./src/lib/posts.ts)
- [`src/app/api/post/route.ts`](./src/app/api/post/route.ts)
- [`src/components/Search.tsx`](./src/components/Search.tsx)
- [`src/app/blog/page.tsx`](./src/app/blog/page.tsx)
- [`src/app/page.tsx`](./src/app/page.tsx)
- [`src/app/blog/[slug]/page.tsx`](./src/app/blog/[slug]/page.tsx)
- [`scripts/generate-posts-json.ts`](./scripts/generate-posts-json.ts)
- [`tsconfig.json`](./tsconfig.json)
- [`src/app/api/upload-image/route.ts`](./src/app/api/upload-image/route.ts)
- [`src/components/WritePage.tsx`](./src/components/WritePage.tsx)
- [`Dockerfile`](./Dockerfile)
- [`docker-compose.yml`](./docker-compose.yml)

## 10. Recommended Next Steps

1. run a full local build after the dependency upgrade:

```bash
npm install
npm run build
```

2. redeploy with the patched Next.js version and confirm the lockfile used by Vercel
3. test blog list first paint in production after deploy
4. add stronger diagnostics to the image upload API
5. if needed, move image upload off GitHub Contents API to dedicated object storage later
