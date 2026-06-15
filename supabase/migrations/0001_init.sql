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

-- Base table privileges: anon needs SELECT (so its own row is visible to the
-- policies below) and INSERT (to create rows).
grant select, insert on public.responses to anon;

-- Anonymous visitors may insert their own response.
create policy "anon can insert responses" on public.responses
  for insert to anon
  with check (true);

-- Anonymous visitors may read rows if they know the id. The id is a
-- client-generated UUID kept in localStorage, acting as a capability token —
-- it is not guessable, so this does not meaningfully expose other
-- respondents' rows. This is also required for UPDATE to work at all:
-- Postgres only lets UPDATE target rows that are visible per a SELECT
-- policy, so without this, "anon can update own response" below would
-- silently match zero rows. The results UI gets aggregates from
-- get_survey_counts() rather than querying this table directly.
create policy "anon can read own response" on public.responses
  for select to anon
  using (true);

-- Anonymous visitors may update their own response row (autosave drafts, and
-- mark completed_at on submit) as long as they know its id.
create policy "anon can update own response" on public.responses
  for update to anon
  using (true)
  with check (true);

-- Restrict which columns anon can write via update (id/created_at are immutable).
revoke update on public.responses from anon;
grant update (q1, q2, q3, q4, q5, updated_at, completed_at) on public.responses to anon;

-- Aggregate counts per question/option + total respondents, exposed to anon
-- via RPC so individual responses stay private. Excludes the caller's own
-- row (p_respondent_id) since the UI folds the caller's current picks back
-- in locally via tallyQuestion's "mine" bonus.
drop function if exists public.get_survey_counts();

create or replace function public.get_survey_counts(p_respondent_id uuid default null)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'total', (select count(*) from responses where id is distinct from p_respondent_id),
    'q1', (select coalesce(jsonb_object_agg(opt, n), '{}'::jsonb)
           from (select unnest(q1) as opt, count(*) as n from responses where id is distinct from p_respondent_id group by 1) s),
    'q2', (select coalesce(jsonb_object_agg(q2, n), '{}'::jsonb)
           from (select q2, count(*) as n from responses where q2 is not null and id is distinct from p_respondent_id group by 1) s),
    'q3', (select coalesce(jsonb_object_agg(q3, n), '{}'::jsonb)
           from (select q3, count(*) as n from responses where q3 is not null and id is distinct from p_respondent_id group by 1) s),
    'q4', (select coalesce(jsonb_object_agg(q4, n), '{}'::jsonb)
           from (select q4, count(*) as n from responses where q4 is not null and id is distinct from p_respondent_id group by 1) s),
    'q5', (select coalesce(jsonb_object_agg(q5, n), '{}'::jsonb)
           from (select q5, count(*) as n from responses where q5 is not null and id is distinct from p_respondent_id group by 1) s)
  );
$$;

grant execute on function public.get_survey_counts(uuid) to anon;
