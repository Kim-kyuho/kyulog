# 블로그 성능 및 빌드 이슈 상세 보고서

작성일: 2026-04-11

프로젝트: `kyulog`

## 1. 문서 목적

이 문서는 이번 작업에서 발생했던 주요 이슈를 한국어로 상세 정리한 보고서이다.

정리 범위는 다음과 같다.

- Neon DB 연동 이후 게시판 목록이 느려진 원인
- 실제로 수정한 소스 코드와 구조 변경 내용
- 빌드 과정에서 발생한 에러와 원인
- `generate-posts-json.ts` 제거 과정
- GitHub Actions에서 삭제한 파일이 계속 실행된 것처럼 보였던 이유
- 현재 구조가 어떤 방식으로 데이터를 가져오는지에 대한 정리

## 2. 게시판 목록이 느려진 문제

### 2.1 증상

- 블로그 목록 페이지(`/blog`) 진입 시 게시글 목록이 예전보다 늦게 표시되었다.
- Markdown 파일이나 정적 JSON 기반으로 읽던 시기보다, Neon DB로 전환한 뒤 체감 지연이 커졌다.

### 2.2 직접적인 원인

#### 원인 1. 클라이언트 마운트 후 추가 fetch가 있었다

문제 파일:

- [`src/components/Search.tsx`](./src/components/Search.tsx)

기존 구조는 다음과 같았다.

1. `/blog` 페이지가 먼저 렌더링된다.
2. 클라이언트 컴포넌트인 `Search`가 마운트된다.
3. 마운트 이후 `fetch("/api/post")`를 실행한다.
4. `/api/post`가 다시 DB를 조회한다.

즉, 사용자 입장에서는 다음 단계가 한 번 더 생겼다.

- 브라우저
- Next API
- DB

이 구조는 예전보다 다음과 같은 비용을 더 만들었다.

- 초기 화면 표시 전 추가 네트워크 왕복
- JSON 응답 대기 시간
- 클라이언트에서 응답 파싱 및 상태 반영 시간

기존 문제 코드 요약:

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

#### 원인 2. 목록에 필요 없는 `content`까지 같이 조회했다

문제 파일:

- [`src/app/api/post/route.ts`](./src/app/api/post/route.ts)
- [`src/db/schema.ts`](./src/db/schema.ts)

기존 API는 아래처럼 전체 컬럼을 조회했다.

```ts
const posts = await db.select().from(blogPosts);
```

그런데 `blog_posts` 테이블에는 목록에 필요 없는 본문 컬럼 `content`가 있었다.

관련 스키마:

```ts
content: text("content"),
```

이 때문에 목록 화면에서도 각 게시글의 본문 전체가 함께 응답에 실릴 수 있었다.

그 결과:

- DB 응답량 증가
- 서버 직렬화 비용 증가
- 응답 payload 크기 증가
- 클라이언트 JSON 파싱 비용 증가

게시글 수가 늘수록 이 구조는 계속 불리해진다.

#### 원인 3. 다른 페이지도 전체 글 데이터를 넓게 읽고 있었다

관련 파일:

- [`src/lib/posts.ts`](./src/lib/posts.ts)
- [`src/app/page.tsx`](./src/app/page.tsx)
- [`src/app/blog/[slug]/page.tsx`](./src/app/blog/[slug]/page.tsx)

문제는 `/blog` 목록 페이지만이 아니었다.

- 홈 화면에서 최신 글 3개만 필요해도 전체 글을 읽는 패턴이 있었고
- 상세 페이지에서 현재 글 하나와 이전/다음 글, 최근 글 몇 개만 필요해도 전체 글을 넓게 읽는 방식이 있었다

이 패턴은 DB를 도입한 뒤 더 큰 비용으로 돌아왔다.

## 3. 느려진 문제를 해결하기 위해 수정한 내용

### 3.1 목록용 조회와 상세용 조회를 분리했다

수정 파일:

- [`src/lib/posts.ts`](./src/lib/posts.ts)

기존에는 사실상 “전체 게시글을 넓게 읽는 함수” 중심이었다.

이를 다음과 같이 분리했다.

- `getPostList()`
- `getRecentPostList(limit)`
- `getPostBySlug(slug)`

핵심은 목록용 조회에서 `content`를 제외한 것이다.

현재 목록 조회 방식:

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

이 변경의 의미:

- 목록은 목록에 필요한 정보만 읽는다
- 본문은 상세 페이지에서만 읽는다

### 3.2 `/blog` 페이지를 서버에서 바로 데이터를 주는 구조로 바꿨다

수정 파일:

- [`src/app/blog/page.tsx`](./src/app/blog/page.tsx)
- [`src/components/Search.tsx`](./src/components/Search.tsx)

변경 전:

- `Search`가 클라이언트에서 `/api/post`를 다시 호출

변경 후:

- `BlogPage`가 서버 컴포넌트에서 `getPostList()`를 호출
- 그 결과를 `Search initialPosts`로 전달

현재 구조:

```ts
export default async function BlogPage() {
  const posts = await getPostList();

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">POST</h1>
      <Search initialPosts={posts} />
    </main>
  );
}
```

이렇게 바뀌면서 제거된 것은 다음이다.

- 클라이언트 마운트 후 별도 목록 fetch
- 목록 표시를 위한 추가 API 왕복

즉 현재 `/blog` 첫 로딩 기준 구조는 다음과 같다.

- 브라우저
- Next 서버 렌더링
- DB

예전처럼:

- 브라우저
- 클라이언트 마운트
- `/api/post`
- DB

구조는 아니다.

### 3.3 `Search.tsx`는 이제 “받은 목록을 필터링하는 역할”만 한다

수정 파일:

- [`src/components/Search.tsx`](./src/components/Search.tsx)

핵심 변경점:

- `fetch("/api/post")` 제거
- `initialPosts` prop 도입
- 받은 데이터를 한 번 정규화해서 클라이언트에서 검색/태그/카테고리 필터에만 사용

추가 수정:

- 검색어뿐 아니라 태그, 카테고리 변경 시에도 페이지 번호를 1로 되돌리도록 조정

### 3.4 홈 화면과 상세 페이지도 과조회 구조를 줄였다

수정 파일:

- [`src/app/page.tsx`](./src/app/page.tsx)
- [`src/app/blog/[slug]/page.tsx`](./src/app/blog/[slug]/page.tsx)

홈 화면:

- 기존: 전체 게시글을 읽고 그중 3개만 사용
- 변경: `getRecentPostList(3)`로 최신 글만 가져오도록 변경

상세 페이지:

- 현재 글 본문은 `getPostBySlug(slug)`로 읽고
- 이전/다음/최근 글 목록용 정보는 `getPostList()`로 메타데이터만 읽도록 조정

즉 상세 페이지도 “목록 용도인데 본문까지 다 읽는 문제”를 줄였다.

### 3.5 재검증 캐시를 추가했다

수정 파일:

- [`src/app/blog/page.tsx`](./src/app/blog/page.tsx)
- [`src/app/page.tsx`](./src/app/page.tsx)

추가 코드:

```ts
export const revalidate = 60;
```

의미:

- 매 요청마다 바로 DB를 다시 치지 않고
- 짧은 주기로 재검증할 수 있게 했다

이 변경은 반복 조회 시 부담을 줄이는 데 도움이 된다.

## 4. 성능 개선 결과

### 개선 전

- `/blog` 페이지에서 클라이언트가 한 번 더 API를 호출했다
- 목록 API가 `content`까지 내려줬다
- 홈/상세 페이지도 넓은 조회를 사용했다

### 개선 후

- `/blog` 첫 로딩 시 서버가 목록 메타데이터를 바로 내려준다
- 목록 응답에서 `content`를 제외했다
- 홈은 최신 글 메타데이터만 읽는다
- 상세는 현재 글 본문과 메타데이터 목록을 분리해서 읽는다

### 기대 효과

- 첫 목록 표시 속도 개선
- 응답 크기 감소
- DB 부하 감소
- 클라이언트 파싱 비용 감소

## 5. 빌드 과정에서 발생한 문제

성능 구조를 수정한 뒤, 빌드/배포 과정에서 여러 문제가 연쇄적으로 드러났다.

## 6. 빌드 에러 1: `getAllPosts` 제거 후 스크립트가 깨짐

### 증상

다음 에러가 발생했다.

```txt
scripts/generate-posts-json.ts(4,10): error TS2305:
Module '"../src/lib/posts"' has no exported member 'getAllPosts'.
```

### 원인

문제 파일:

- [`scripts/generate-posts-json.ts`](./scripts/generate-posts-json.ts)

상황은 다음과 같았다.

1. `src/lib/posts.ts`에서 `getAllPosts()` 구조를 제거하거나 더 이상 사용하지 않도록 변경했다
2. 그런데 `generate-posts-json.ts`는 여전히 `getAllPosts()`를 import하고 있었다
3. `prebuild` 단계에서 이 스크립트가 실행되며 빌드가 실패했다

문제 코드:

```ts
import { getAllPosts } from "../src/lib/posts";
const posts = await getAllPosts();
```

### 해결

초기에는 `getPostList()`를 사용하도록 바꿨다.

```ts
import { getPostList } from "../src/lib/posts";
const posts = await getPostList();
```

하지만 이후 구조를 재점검한 결과, 이 스크립트 자체가 현재 서비스 구조에서 불필요하다고 판단했다.

결과적으로 최종 조치는 다음과 같았다.

- [`scripts/generate-posts-json.ts`](./scripts/generate-posts-json.ts) 삭제
- [`package.json`](./package.json) 에서 `prebuild` 삭제
- [`public/posts.json`](./public/posts.json) 삭제

## 7. `generate-posts-json.ts`가 왜 불필요했는가

### 역할

이 스크립트의 역할은 본질적으로 아래와 같았다.

1. DB에서 게시글 목록 메타데이터를 읽는다
2. 그것을 다시 `public/posts.json`으로 저장한다

즉:

- DB의 데이터를
- JSON 파일 형태로 한 번 더 복사하는 중간 단계였다

### 왜 제거했는가

현재 구조에서는 다음이 이미 DB를 직접 읽고 있었다.

- [`src/app/blog/page.tsx`](./src/app/blog/page.tsx)
- [`src/app/page.tsx`](./src/app/page.tsx)

따라서 `posts.json`은 핵심 런타임 경로에서 더 이상 필요하지 않았다.

정리하면:

- 있으면 마이그레이션이나 백업 시 참고용으로 쓸 수는 있다
- 하지만 운영 빌드에서 매번 자동 생성할 필요는 없다
- 오히려 빌드 경로를 복잡하게 만들고, 이번처럼 에러를 유발할 가능성이 있다

## 8. 빌드 에러 2: GitHub Actions가 삭제한 스크립트를 계속 실행함

### 증상

다음 로그가 계속 보였다.

```txt
Run npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/generate-posts-json.ts
Error: Cannot find module './generate-posts-json.ts'
```

### 처음 헷갈렸던 이유

처음에는 아래 사실이 확인됐다.

- 로컬에서 스크립트 삭제 완료
- `main` 브랜치에서도 삭제 완료
- `origin/main`에도 워크플로우 파일이 없음

그런데도 GitHub Actions에서 해당 명령이 계속 보였다.

### 실제 원인

원인은 `main`이 아니라 다른 원격 브랜치에 워크플로우가 남아 있었기 때문이다.

확인 결과:

- `origin/main`: 없음
- `origin/feature/neon-db`: 있음

남아 있던 파일:

- `.github/workflows/Generate-posts-json.yml`

그 워크플로우 안에는 여전히 다음이 있었다.

```yml
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/generate-posts-json.ts
```

즉, 사용자는 메인 빌드를 보고 있다고 생각했지만 실제 GitHub Actions 실패는 `feature/neon-db` 브랜치의 워크플로우에서 발생할 수 있는 상태였다.

### 해결 방법

최종적으로 해야 하는 정리는 다음이다.

1. `main`에서 제거
2. 관련 보조 브랜치에서도 제거
3. 더 이상 안 쓰는 브랜치면 아예 삭제

이번 확인으로 알 수 있었던 점:

- `main`에 없다고 해서 전체 저장소에서 완전히 사라진 것은 아니다
- 다른 원격 브랜치에 동일한 workflow가 남아 있으면 Actions는 계속 돌 수 있다

## 9. 빌드 에러 3: `tsconfig.json` 관련 혼선

### 문제 상황

`tsconfig.json`에 대해 다음과 같은 혼선이 있었다.

- `typeRoots`가 실제 프로젝트 구조와 맞지 않았다
- `moduleResolution`이 최신 Next.js 기준에서 덜 적합한 설정이었다
- `baseUrl` 주변에서 에디터 에러가 보였다

관련 파일:

- [`tsconfig.json`](./tsconfig.json)

### 원인

기존 설정 일부:

```json
"moduleResolution": "node",
"typeRoots": ["./types", "./node_modules/@types"],
"baseUrl": ".",
```

문제점:

- `./types` 디렉터리는 실제로 존재하지 않았다
- 실제 선언 파일은 `src/app/types` 아래에 있었다
- `moduleResolution: "node"`는 최신 Next.js 환경보다 덜 적합했다
- `baseUrl` 자체는 잘못된 옵션은 아니지만, 현재 구조에서는 없어도 되는 설정이었다

### 해결

최종 조치:

- `moduleResolution`을 `"bundler"`로 변경
- `typeRoots` 제거
- `baseUrl` 제거

이 변경으로 설정을 프로젝트 실제 구조에 더 가깝게 단순화했다.

## 10. 보안 경고: Next.js 취약 버전 문제

### 증상

Vercel에서 다음 경고가 발생했다.

```txt
Error: Vulnerable version of Next.js detected, please update immediately.
```

### 원인

- 사용 중인 `next` 버전이 보안 공지 대상 범위에 포함되어 있었다

### 해결 방향

- `next`를 패치된 안전 버전으로 올려야 했다
- 의존성을 다시 설치하고 재배포해야 했다

관련 파일:

- [`package.json`](./package.json)

## 11. Docker에서 `@neondatabase/serverless`를 못 찾는 문제

### 증상

`docker compose up -d` 실행 시 다음과 같은 에러가 발생할 수 있었다.

```txt
Module not found: Can't resolve '@neondatabase/serverless'
```

### 원인

관련 파일:

- [`Dockerfile`](./Dockerfile)
- [`docker-compose.yml`](./docker-compose.yml)

원인은 코드에 패키지가 없어서가 아니라, Docker 볼륨 구조 때문일 가능성이 높았다.

상황:

- 로컬 `node_modules`에는 패키지가 설치되어 있음
- 컨테이너는 `/app`를 바인드 마운트함
- `/app/node_modules`는 익명 볼륨으로 유지됨
- 이 익명 볼륨이 오래된 상태면 새로 추가한 패키지가 컨테이너 안에 반영되지 않을 수 있음

### 해결 방법

```bash
docker compose down -v
docker compose up -d --build
```

즉 오래된 볼륨을 버리고 다시 빌드하는 것이 핵심이다.

## 12. 업로드 이슈 분석

### 증상

- 서비스 환경에서 이미지 업로드가 한때 안 되는 것처럼 보였다

관련 파일:

- [`src/app/api/upload-image/route.ts`](./src/app/api/upload-image/route.ts)
- [`src/components/WritePage.tsx`](./src/components/WritePage.tsx)

### 분석된 원인 후보

1. 환경변수 누락
   - `GITHUB_TOKEN`
   - `REPO_OWNER`
   - `REPO_NAME`
2. GitHub 토큰 권한 부족
3. 브랜치를 `main`으로 고정한 구조
4. 파일 크기/서버리스 제한
5. 에러 응답을 너무 뭉뚱그려서 실제 원인을 보기 어려움

### 결과

- 이후에는 업로드가 다시 정상 동작함
- 따라서 현재는 코드 결함보다는 환경 상태, 권한, 일시적 실패 가능성이 더 높다고 판단됨

### 현재 상태

- 업로드 관련 코드는 아직 “분석만 했고 수정은 하지 않은 상태”

## 13. 이번 작업에서 실제로 수정하거나 삭제한 주요 파일

### 성능 개선 관련

- [`src/lib/posts.ts`](./src/lib/posts.ts)
- [`src/app/api/post/route.ts`](./src/app/api/post/route.ts)
- [`src/components/Search.tsx`](./src/components/Search.tsx)
- [`src/app/blog/page.tsx`](./src/app/blog/page.tsx)
- [`src/app/page.tsx`](./src/app/page.tsx)
- [`src/app/blog/[slug]/page.tsx`](./src/app/blog/[slug]/page.tsx)

### 빌드/설정 정리 관련

- [`package.json`](./package.json)
- [`tsconfig.json`](./tsconfig.json)

### 삭제된 파일

- `scripts/generate-posts-json.ts`
- `public/posts.json`
- `.github/workflows/Generate-posts-json.yml`

## 14. 최종 정리

### 핵심 원인

이번 게시판 속도 저하의 본질적인 원인은 다음 두 가지였다.

1. 클라이언트에서 한 번 더 API를 호출하는 구조
2. 목록 조회인데도 게시글 본문까지 포함해서 읽는 과조회 구조

### 핵심 해결

이를 해결하기 위해 다음을 적용했다.

1. 목록용 조회와 상세용 조회를 분리
2. `/blog` 목록을 서버에서 직접 읽어서 초기 렌더링에 포함
3. `content`를 목록 응답에서 제외
4. 홈/상세도 과한 전체 조회를 줄임
5. 짧은 재검증 캐시를 추가

### 부수적으로 드러난 문제

성능 개선 이후 다음과 같은 보조 문제들도 드러났다.

- 불필요한 `generate-posts-json.ts` 빌드 경로
- 남아 있던 GitHub Actions workflow
- `tsconfig.json`의 불필요한 설정
- Docker 볼륨 기반 의존성 불일치
- 업로드 환경 이슈 가능성

### 현재 결론

- 게시판 목록 성능 문제는 구조적으로 개선됨
- `generate-posts-json.ts` 관련 빌드 경로는 정리됨
- `main` 기준으로 해당 workflow는 제거됨
- 다만 다른 보조 브랜치에 남은 workflow 여부는 계속 주의해야 함

## 15. 권장 후속 작업

1. `feature/neon-db` 같은 보조 브랜치에도 불필요한 workflow가 남아 있는지 정리
2. Next.js 및 `eslint-config-next` 버전 정합성 점검
3. 업로드 API에 실패 원인을 더 잘 보여주는 진단 로직 추가
4. `.next` 산출물이나 오래된 문서 안의 과거 설명은 필요 시 정리

