# Work History

Date: 2026-04-11
Workspace: `/Users/gimgyuho/Desktop/kyulog`

## 1. Environment and Billing Check

- Confirmed this session is a Codex-style coding agent connected through account login, not through a locally configured `OPENAI_API_KEY`.
- Verified local Codex config and auth state:
  - `~/.codex/config.toml`
  - `~/.codex/auth.json`
- Found that:
  - `OPENAI_API_KEY` was unset in the environment.
  - Auth was based on login tokens rather than a user-provided API key.
- Opened the OpenAI billing page in the browser:
  - `https://platform.openai.com/settings/organization/billing/overview`
- User confirmed the billing page showed `$0`, so current evidence suggested there was no separate API usage charge active.

## 2. AuthStatus Review and Optimization

Reviewed:

- [`src/components/AuthStatus.tsx`](./src/components/AuthStatus.tsx)
- [`src/components/Header.tsx`](./src/components/Header.tsx)
- [`src/lib/auth.ts`](./src/lib/auth.ts)
- [`src/app/types/next-auth.d.ts`](./src/app/types/next-auth.d.ts)

### Problems identified

- Loading UI in the header used plain `Loading...`, which could cause layout shift.
- Display name logic depended too narrowly on `user.login ?? user.name`.
- `user.isAdmin` was optional, but the UI treated falsy values as a concrete viewer state.
- `signIn()` and `signOut()` did not specify a deterministic `callbackUrl`.

### Changes applied

Updated [`src/components/AuthStatus.tsx`](./src/components/AuthStatus.tsx):

- Added `usePathname()` from `next/navigation`.
- Replaced the loading text with a stable skeleton placeholder.
- Added a safer display-name fallback chain:
  - `login`
  - `name`
  - `email`
  - `"user"`
- Tightened admin evaluation to `user.isAdmin === true`.
- Added explicit `callbackUrl` handling for both sign-in and sign-out.
- Added inline comments above the optimized code blocks as requested.

### Validation note

- Attempted `npm run lint`, but the command did not finish with a usable result in this environment.

## 3. Blog Performance Investigation

Investigated slow blog list loading after moving to a cloud database.

Reviewed:

- [`src/components/Search.tsx`](./src/components/Search.tsx)
- [`src/app/api/post/route.ts`](./src/app/api/post/route.ts)
- [`src/lib/posts.ts`](./src/lib/posts.ts)
- [`src/db/schema.ts`](./src/db/schema.ts)
- [`src/app/page.tsx`](./src/app/page.tsx)
- [`src/app/blog/page.tsx`](./src/app/blog/page.tsx)
- [`src/app/blog/[slug]/page.tsx`](./src/app/blog/[slug]/page.tsx)

### Root causes identified

1. Blog list page fetched data on the client after mount with `fetch("/api/post")`.
2. The API returned full rows with `select *`, including the large `content` column.
3. Multiple pages used broad full-table reads where lightweight metadata queries were enough.
4. Cloud DB latency amplified the cost of this query and rendering structure.

## 4. Blog Data Path Refactor

### Query layer changes

Updated [`src/lib/posts.ts`](./src/lib/posts.ts):

- Removed the old full-list usage pattern.
- Added `getPostList()` for lightweight list metadata only:
  - `id`
  - `title`
  - `date`
  - `category`
  - `tags`
  - `summary`
- Added `getRecentPostList(limit)` for homepage usage.
- Kept `getPostBySlug(slug)` for full post detail retrieval.

### API changes

Updated [`src/app/api/post/route.ts`](./src/app/api/post/route.ts):

- Replaced direct `db.select().from(blogPosts)` with `getPostList()`.
- This removed `content` from the blog list API response.

## 5. Blog List Rendering Refactor

Updated [`src/app/blog/page.tsx`](./src/app/blog/page.tsx):

- Converted the page to an async server component.
- Loaded posts on the server with `getPostList()`.
- Passed the initial list into the client component.
- Added `export const revalidate = 60`.

Updated [`src/components/Search.tsx`](./src/components/Search.tsx):

- Added `initialPosts` prop.
- Removed the client-side fetch to `/api/post`.
- Normalized incoming post data once from server-provided props.
- Kept client-side filtering and pagination behavior.
- Reset current page not only on query change, but also on tag/category changes.

### Performance impact

- Removed one full client-side network round trip on the blog list page.
- Reduced response size by excluding post body content from list responses.
- Improved first render by sending initial list data from the server.

## 6. Additional Page Optimizations

Updated [`src/app/page.tsx`](./src/app/page.tsx):

- Replaced full post loading with `getRecentPostList(3)`.
- Added `export const revalidate = 60`.

Updated [`src/app/blog/[slug]/page.tsx`](./src/app/blog/[slug]/page.tsx):

- Replaced `getAllPosts()` usage with `getPostList()` for navigation/recent-post metadata.
- Loaded current post detail and lightweight post list in parallel.
- Stopped loading full post content for all posts when rendering a single post page.

## 7. Verification Attempts

- Ran `git diff` on modified files to inspect the final patch.
- Attempted `npx tsc --noEmit`, but the command did not complete with a usable result in this environment.

## 8. Files Modified

- [`src/components/AuthStatus.tsx`](./src/components/AuthStatus.tsx)
- [`src/lib/posts.ts`](./src/lib/posts.ts)
- [`src/app/api/post/route.ts`](./src/app/api/post/route.ts)
- [`src/components/Search.tsx`](./src/components/Search.tsx)
- [`src/app/blog/page.tsx`](./src/app/blog/page.tsx)
- [`src/app/page.tsx`](./src/app/page.tsx)
- [`src/app/blog/[slug]/page.tsx`](./src/app/blog/[slug]/page.tsx)

## 9. Expected Outcome

- Blog list should render faster because it no longer waits for a client-side fetch after mount.
- Blog list payloads should be much smaller because `content` is not included in list queries.
- Homepage and detail page should put less load on the database than before.
- Authentication status UI should behave more consistently and predictably in the header.
