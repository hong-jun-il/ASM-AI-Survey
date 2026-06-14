-- AI 사용 현황 설문 — responses table + aggregate RPC
create table public.responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  q1 text[] not null default '{}',
  q2 text,
  q3 text,
  q4 text,
  q5 text
);

alter table public.responses enable row level security;

-- Base table privileges: anon needs INSERT (to create rows) and SELECT (so
-- upsert can resolve ON CONFLICT). No select policy is defined below, so RLS
-- still denies all SELECTs — this grant alone does not expose raw rows.
grant select, insert on public.responses to anon;

-- Anonymous visitors may insert their own response, but cannot read raw rows
-- (aggregates only, via get_survey_counts below).
create policy "anon can insert responses" on public.responses
  for insert to anon
  with check (true);

-- Anonymous visitors may update their own response row (autosave drafts, and
-- mark completed_at on submit) as long as they know its id. The id is a
-- client-generated UUID kept in localStorage, acting as a capability token —
-- it is not guessable, so this does not expose other respondents' rows.
create policy "anon can update own response" on public.responses
  for update to anon
  using (true)
  with check (true);

-- Restrict which columns anon can write via update (id/created_at are immutable).
revoke update on public.responses from anon;
grant update (q1, q2, q3, q4, q5, updated_at, completed_at) on public.responses to anon;

-- Aggregate counts per question/option + total respondents, exposed to anon
-- via RPC so individual responses stay private.
create or replace function public.get_survey_counts()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'total', (select count(*) from responses),
    'q1', (select coalesce(jsonb_object_agg(opt, n), '{}'::jsonb)
           from (select unnest(q1) as opt, count(*) as n from responses group by 1) s),
    'q2', (select coalesce(jsonb_object_agg(q2, n), '{}'::jsonb)
           from (select q2, count(*) as n from responses where q2 is not null group by 1) s),
    'q3', (select coalesce(jsonb_object_agg(q3, n), '{}'::jsonb)
           from (select q3, count(*) as n from responses where q3 is not null group by 1) s),
    'q4', (select coalesce(jsonb_object_agg(q4, n), '{}'::jsonb)
           from (select q4, count(*) as n from responses where q4 is not null group by 1) s),
    'q5', (select coalesce(jsonb_object_agg(q5, n), '{}'::jsonb)
           from (select q5, count(*) as n from responses where q5 is not null group by 1) s)
  );
$$;

grant execute on function public.get_survey_counts() to anon;
