-- Adds "status" (student / employed / etc.) and "company_size" questions for segmentation.
alter table public.responses add column status text;
alter table public.responses add column company_size text;

grant update (status, company_size, q1, q2, q3, q4, q5, updated_at, completed_at) on public.responses to anon;

drop function if exists public.get_survey_counts(uuid);

create or replace function public.get_survey_counts(p_respondent_id uuid default null)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'total', (select count(*) from responses where id is distinct from p_respondent_id),
    'status', (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
           from (select status, count(*) as n from responses where status is not null and id is distinct from p_respondent_id group by 1) s),
    'company_size', (select coalesce(jsonb_object_agg(company_size, n), '{}'::jsonb)
           from (select company_size, count(*) as n from responses where company_size is not null and id is distinct from p_respondent_id group by 1) s),
    'q1', (select coalesce(jsonb_object_agg(opt, n), '{}'::jsonb)
           from (select unnest(q1) as opt, count(*) as n from responses where id is distinct from p_respondent_id group by 1) s),
    'q2', (select coalesce(jsonb_object_agg(q2, n), '{}'::jsonb)
           from (select q2, count(*) as n from responses where q2 is not null and id is distinct from p_respondent_id group by 1) s),
    'q3', (select coalesce(jsonb_object_agg(opt, n), '{}'::jsonb)
           from (select unnest(q3) as opt, count(*) as n from responses where id is distinct from p_respondent_id group by 1) s),
    'q4', (select coalesce(jsonb_object_agg(q4, n), '{}'::jsonb)
           from (select q4, count(*) as n from responses where q4 is not null and id is distinct from p_respondent_id group by 1) s),
    'q5', (select coalesce(jsonb_object_agg(q5, n), '{}'::jsonb)
           from (select q5, count(*) as n from responses where q5 is not null and id is distinct from p_respondent_id group by 1) s)
  );
$$;

grant execute on function public.get_survey_counts(uuid) to anon;