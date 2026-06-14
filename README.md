# 사내 AI 사용 현황 설문

로그인 없는 익명 설문 → 문항 선택 즉시 실시간 라이브 폴 → 전체 결과(가로 막대 차트) 확인까지 동작하는 Next.js 앱입니다.

## 스택

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (+ 디자인 원본 CSS 포팅)
- TanStack Query (집계 조회 / 응답 제출)
- Supabase (Postgres + RLS + RPC)

## Supabase 설정

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. **SQL Editor**에서 아래 두 파일을 순서대로 실행합니다.
   - `supabase/migrations/0001_init.sql` — `responses` 테이블, RLS 정책, `get_survey_counts()` RPC 생성
   - `supabase/seed.sql` — 원본 디자인의 mock 분포(247명)를 재현하는 시드 데이터 삽입
3. **Project Settings → API**에서 `Project URL`과 `Publishable` key를 복사합니다.
4. 프로젝트 루트에 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Supabase 설정 전에도 `pnpm dev`로 UI/인터랙션 확인은 가능합니다 (집계는 0으로 표시되고, 화면 상단에 설정 안내 배너가 노출됩니다).

## 개발 서버 실행

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

## 데이터 모델

- `responses` 테이블: 응답 1건당 1행. `q1`은 복수선택(text[]), `q2`~`q5`는 단일선택(text, `q5`는 선택사항이라 null 허용). `id`는 클라이언트가 생성한 UUID(`respondentId`, localStorage에 보관)이고, `completed_at`은 제출 완료 시각(null이면 미완료/이탈).
- 익명(`anon`)은 `insert`와 `q1~q5/updated_at/completed_at` 컬럼에 대한 `update`만 가능하고, 행을 조회(`select`)할 수는 없습니다. 집계는 `get_survey_counts()` RPC(문항별/옵션별 카운트 + 총 응답수)로만 노출됩니다.
- **자동 저장**: 문항을 선택할 때마다 `id = respondentId`로 upsert되어 응답이 즉시 서버에 반영됩니다. 설문을 끝까지 마치지 않고 이탈해도 그때까지 고른 답변은 DB에 남습니다(`completed_at`은 null). `id`(UUID)를 알아야 자신의 행을 수정할 수 있는 capability-token 방식이라, 다른 사람의 응답을 임의로 수정할 수 없습니다.
- "전체 결과 모아 보기"를 누르면 같은 행에 `completed_at`을 채워 제출을 완료 처리합니다.
- "다시 참여하기"는 브라우저의 localStorage만 초기화하고 새 `respondentId`를 발급합니다 — 이전 행은 DB에 그대로 남고, 재참여 시 새 행이 추가됩니다.
