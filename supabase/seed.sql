-- Seeds 247 synthetic respondents reproducing the original prototype's mock
-- distribution (lib/survey-data.ts had these as per-option `count`s before
-- the move to a real backend). Each single-select CTE shuffles an array that
-- contains each option exactly `count` times (summing to 247); each Q1
-- option CTE shuffles a 247-length '1'/'0' array so the option's count of
-- rows include it. Run once against a fresh `responses` table.
with
  q2 as (
    select row_number() over (order by random()) as i, val from unnest(
      array_fill('enterprise'::text, array[58])
      || array_fill('personal_sub'::text, array[71])
      || array_fill('credit'::text, array[34])
      || array_fill('selfhosted'::text, array[22])
      || array_fill('none_support'::text, array[49])
      || array_fill('no_use'::text, array[13])
    ) as val
  ),
  q3 as (
    select row_number() over (order by random()) as i, val from unnest(
      array_fill('claude_free'::text, array[12])
      || array_fill('claude_pro'::text, array[44])
      || array_fill('claude_max20'::text, array[18])
      || array_fill('claude_max100'::text, array[9])
      || array_fill('claude_ent'::text, array[15])
      || array_fill('gpt_free'::text, array[21])
      || array_fill('gpt_plus'::text, array[63])
      || array_fill('gpt_pro'::text, array[19])
      || array_fill('gpt_team'::text, array[24])
      || array_fill('gpt_ent'::text, array[22])
    ) as val
  ),
  q4 as (
    select row_number() over (order by random()) as i, val from unnest(
      array_fill('low'::text, array[52])
      || array_fill('half'::text, array[98])
      || array_fill('high'::text, array[64])
      || array_fill('over'::text, array[33])
    ) as val
  ),
  q5 as (
    select row_number() over (order by random()) as i, val from unnest(
      array_fill('dev'::text, array[96])
      || array_fill('pm'::text, array[58])
      || array_fill('design'::text, array[31])
      || array_fill('marketing'::text, array[27])
      || array_fill('biz'::text, array[19])
      || array_fill('etc'::text, array[16])
    ) as val
  ),
  o_chatgpt as (
    select row_number() over (order by random()) as i, val from unnest(
      array_fill('1'::text, array[198]) || array_fill('0'::text, array[49])
    ) as val
  ),
  o_claude as (
    select row_number() over (order by random()) as i, val from unnest(
      array_fill('1'::text, array[142]) || array_fill('0'::text, array[105])
    ) as val
  ),
  o_gemini as (
    select row_number() over (order by random()) as i, val from unnest(
      array_fill('1'::text, array[76]) || array_fill('0'::text, array[171])
    ) as val
  ),
  o_copilot as (
    select row_number() over (order by random()) as i, val from unnest(
      array_fill('1'::text, array[89]) || array_fill('0'::text, array[158])
    ) as val
  ),
  o_inhouse as (
    select row_number() over (order by random()) as i, val from unnest(
      array_fill('1'::text, array[41]) || array_fill('0'::text, array[206])
    ) as val
  ),
  o_etc as (
    select row_number() over (order by random()) as i, val from unnest(
      array_fill('1'::text, array[23]) || array_fill('0'::text, array[224])
    ) as val
  )
insert into public.responses (q1, q2, q3, q4, q5, completed_at)
select
  array_remove(array[
    case when o_chatgpt.val = '1' then 'chatgpt' end,
    case when o_claude.val = '1' then 'claude' end,
    case when o_gemini.val = '1' then 'gemini' end,
    case when o_copilot.val = '1' then 'copilot' end,
    case when o_inhouse.val = '1' then 'inhouse' end,
    case when o_etc.val = '1' then 'etc' end
  ], null),
  q2.val,
  q3.val,
  q4.val,
  q5.val,
  now()
from q2
join q3 on q3.i = q2.i
join q4 on q4.i = q2.i
join q5 on q5.i = q2.i
join o_chatgpt on o_chatgpt.i = q2.i
join o_claude on o_claude.i = q2.i
join o_gemini on o_gemini.i = q2.i
join o_copilot on o_copilot.i = q2.i
join o_inhouse on o_inhouse.i = q2.i
join o_etc on o_etc.i = q2.i;
