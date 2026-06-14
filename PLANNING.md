# AI 사용 현황 설문 — 구현 기획서

## 1. 배경

Claude Design 프로토타입(`AI 설문조사.html`, React+Babel CDN)을 기반으로, 사내 AI 사용 방식(엔터프라이즈/개인구독/크레딧 등)을 파악하기 위한 익명 설문을 Next.js 앱으로 구현한다.

- 로그인 없이 익명 참여, 링크 공유로 접근
- 문항(옵션)을 선택하는 즉시 그 문항의 실시간 분포가 열리는 **라이브 폴** 방식
- 모든 문항 응답 후 "전체 결과 모아 보기"로 결과 화면 전환 (가로 막대 차트 + "내 응답" 강조)
- 집계 데이터는 Supabase(Postgres)에 실제 저장/조회

## 2. 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16.2.9 (App Router), React 19.2.4 |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 (+ 원본 CSS 포팅을 위한 plain CSS 병행) |
| 데이터 페칭/캐싱 | **TanStack Query v5** |
| 백엔드 | Supabase (Postgres + RLS + RPC, anon key) |
| 패키지 매니저 | pnpm |

> Next.js 16은 이전 버전과 컨벤션이 다른 부분이 있으므로(`AGENTS.md` 참고), 구현 시 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 확인한다 (특히 App Router 페이지/레이아웃, 메타데이터, 클라이언트/서버 컴포넌트 경계 관련 변경사항).

## 3. 프로젝트 구조

```
asm-ai-survey/
├── app/
│   ├── layout.tsx          # Pretendard 폰트 로드, 메타데이터, <Providers> 래핑
│   ├── providers.tsx        # "use client" — QueryClientProvider
│   ├── page.tsx             # <SurveyApp/> 렌더
│   └── globals.css          # 원본 CSS 포팅 (커스텀 프로퍼티 고정값) + Tailwind
├── components/
│   ├── SurveyApp.tsx        # view 상태(survey/results), answers, submit 플로우
│   ├── Survey.tsx           # hero + 문항 리스트 + 하단 고정 제출바
│   ├── Question.tsx         # 문항 1개 (라이브 폴 토글 로직)
│   ├── OptionRow.tsx         # 옵션 버튼 (체크박스/라디오 + fill bar)
│   ├── Results.tsx           # 결과 hero + 액션 버튼
│   ├── ResultBlock.tsx       # 문항별 결과 블록 (그룹 처리 포함)
│   └── Bar.tsx                # 막대 차트 1줄 (애니메이션)
├── lib/
│   ├── survey-data.ts        # 문항/옵션 메타데이터 (count 없음 — DB에서 조회)
│   ├── types.ts               # Question, Option, Answers, CountsMap, SurveyCounts
│   ├── supabase.ts            # 브라우저 supabase client (anon key, env 없으면 null)
│   ├── queries.ts             # TanStack Query 훅: useSurveyCounts, useSubmitResponse
│   ├── results.ts             # tallyQuestion / buildResults (counts 기반 집계 계산)
│   └── storage.ts             # localStorage 저장/복원, respondentId 발급
├── supabase/
│   ├── migrations/0001_init.sql   # responses 테이블 + RLS + get_survey_counts() RPC
│   └── seed.sql                    # 247명분 시드 데이터 (원본 mock 카운트 재현)
├── .env.example                # NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
└── README.md                    # Supabase 설정 가이드
```

## 4. 데이터 모델 (Supabase / Postgres)

`responses` 테이블 — 응답 1건당 1행:

```sql
create table public.responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  q1 text[] not null default '{}',  -- 복수선택
  q2 text, q3 text, q4 text, q5 text -- 단일선택, q5는 선택사항이라 null 허용
);

alter table public.responses enable row level security;

-- 익명 insert만 허용 (원본 행 직접 조회는 차단)
create policy "anon can insert" on public.responses
  for insert to anon with check (true);
```

집계는 `get_survey_counts()` RPC(security definer)로만 제공 — 문항별/옵션별 카운트 + 총 응답수를 `jsonb`로 반환:

```jsonb
{
  "total": 248,
  "q1": { "chatgpt": 199, "claude": 142, ... },
  "q2": { "enterprise": 58, ... },
  "q3": { "claude_pro": 44, "gpt_plus": 63, ... },
  "q4": { ... },
  "q5": { ... }
}
```

`supabase/seed.sql`은 원본 mock 카운트(Q1 198/142/76/89/41/23, Q2 58/71/34/22/49/13, Q3 claude 12/44/18/9/15 + gpt 21/63/19/24/22, Q4 52/98/64/33, Q5 96/58/31/27/19/16)를 정확히 재현하는 247행을 생성한다.

## 5. 데이터 페칭 / 상태관리 — TanStack Query

`app/providers.tsx`에서 `QueryClientProvider`로 앱을 감싼다.

`lib/queries.ts`:

```ts
// 집계 카운트 조회
export function useSurveyCounts() {
  return useQuery({
    queryKey: ["survey-counts"],
    queryFn: async () => {
      const { data, error } = await supabase!.rpc("get_survey_counts");
      if (error) throw error;
      return data as SurveyCounts;
    },
    enabled: !!supabase,
  });
}

// 응답 제출
export function useSubmitResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (answers: Answers) => {
      const { error } = await supabase!
        .from("responses")
        .insert({
          q1: answers.q1 ?? [],
          q2: answers.q2 ?? null,
          q3: answers.q3 ?? null,
          q4: answers.q4 ?? null,
          q5: answers.q5 ?? null,
        });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["survey-counts"] }),
  });
}
```

- **SurveyApp**: `useSurveyCounts()`로 `counts` 로드 (로딩 중엔 모든 옵션 0으로 표시, 라이브 폴/토글 동작은 그대로 가능).
- **제출**: `useSubmitResponse().mutate(answers)` → 성공 시 localStorage에 `{respondentId, answers, submitted:true}` 저장 + counts 쿼리 무효화(재조회) 후 `view="results"`. 실패 시 제출바 아래 인라인 에러 메시지, view 전환 안 함.
- Supabase 미설정(`enabled:false`) 시 `counts`는 `undefined` → 모든 옵션 tally 0, denom 0으로 처리.

## 6. 컴포넌트 동작 (원본 app.jsx 포팅, tweaks 패널 제외)

- **Question**: 옵션 클릭 시 토글 — 단일선택은 클릭=선택/재클릭=해제/다른 옵션 클릭=이동, 복수선택(Q1)은 옵션별 개별 토글. `tallyQuestion(q, value, counts)`으로 즉시 분포 계산 → `revealed`/`pct`/`tally`를 `OptionRow`에 전달. Q3는 `groups`로 Claude/ChatGPT 그리드 분리.
- **OptionRow**: 원본 클래스 유지 (`.opt`, `.opt--on`, `.opt--poll`, `.ind--box`/`.ind--dot`, `.opt-fill`, `.opt-pct`).
- **Survey**: hero + 문항 리스트 + 하단 고정 제출바 (`answeredCount/all.length` 진행률, "전체 결과 모아 보기" 버튼은 1개 이상 응답 시 활성화).
- **Results / ResultBlock / Bar**: `buildResults(answers, counts)` 기준 가로 막대(퍼센트+응답수), "내 응답" 태그, Q3 그룹 분리, 막대 진입 애니메이션.
- **다시 참여하기**: localStorage 초기화 + `answers={}` + `view="survey"` (DB 행은 삭제하지 않음 — README에 명시).
- **공유**: `navigator.clipboard.writeText(location.href)`.

## 7. 스타일

`app/globals.css`에 원본 `<style>` 블록을 거의 그대로 포팅 (pixel-perfect):

- Tweaks 관련 커스텀 프로퍼티는 고정값 (`--accent:#4F46E5`, `--radius:14px`, `--opt-pad:16px 16px`).
- `prefers-reduced-motion` 게이팅된 진입 애니메이션, `.submit-bar` fixed 포지셔닝, `.bar-fill`/`.opt-fill` 트랜지션 등 원본의 버그 수정 내용 유지.
- Tailwind v4 (`@import "tailwindcss"`)와 기존 커스텀 클래스(`.opt`, `.bar`, `.q-list` 등)는 plain CSS로 공존.
- Pretendard는 CDN `<link>`로 `layout.tsx`에 추가.

## 8. 환경설정

- `.env.example`: `NEXT_PUBLIC_SUPABASE_URL=`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
- `lib/supabase.ts`: env var 없으면 `null` 반환 → 위 5번 항목의 graceful degradation 적용.
- `README.md`: Supabase 프로젝트 생성 → SQL Editor에서 `migrations/0001_init.sql` + `seed.sql` 실행 → URL/anon key를 `.env.local`에 입력 → `pnpm dev`.

## 9. 빌드 순서

1. `pnpm add @supabase/supabase-js`
2. `lib/` 모듈 작성 (survey-data, types, storage, supabase, queries, results)
3. `app/providers.tsx` 작성, `layout.tsx`에 적용
4. 컴포넌트 작성: OptionRow → Question → Survey, Bar → ResultBlock → Results, SurveyApp
5. `app/globals.css` 포팅, `app/page.tsx`에서 `<SurveyApp/>` 렌더
6. `supabase/migrations/0001_init.sql`, `supabase/seed.sql`, `.env.example`, `README.md`

## 10. 검증

- `pnpm dev`로 로컬 실행, Supabase 미설정 상태에서 설문 화면 렌더 및 라이브 폴 토글(reveal/취소/이동) 동작 확인, 제출 시 에러 배너 확인.
- 모바일(~390px)/데스크탑(~660px+) 레이아웃 확인 (`opts--grid` 1열/2열 전환, 제출바 고정).
- `pnpm build`로 타입/빌드 에러 확인.
- Supabase 연동은 사용자가 프로젝트 생성 후 키 입력하여 테스트.
